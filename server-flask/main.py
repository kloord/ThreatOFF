from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import pandas as pd
import re
from urllib.parse import urlparse
import io

app = Flask(__name__)
CORS(app)

REQUIRED_COLUMNS = {
    "#",
    "Status",
    "Priority",
    "Subjet",
    "Resource",
    "Tipo de Asset",
    "Updated",
    "Last Seen",
    "Date Found",
    "CVSS Score de la Herramienta",
    "CVSS Score",
    "Puntaje Ponderado",
    "Pertenece a Investments",
    "Negocio"
}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

def clean_resource(value):
    value = str(value).strip()
    # Elimina cualquier cosa antes de la IP (por ejemplo, "/")
    ip_match = re.search(r'(\d{1,3}(?:\.\d{1,3}){3})(:\d+)?', value)
    if ip_match:
        return ip_match.group(1)
    # Si es una URL, extrae solo el dominio principal
    if '://' in value or value.startswith('www.'):
        parsed = urlparse(value)
        domain = parsed.netloc if parsed.netloc else parsed.path.split('/')[0]
        domain = domain.replace('www.', '')
        return domain
    # Si tiene "/" antes o después, elimina todo menos la IP o dominio
    value = value.lstrip('/').rstrip('/')
    # Si es solo dominio con ruta, extrae el dominio
    if '/' in value:
        domain = value.split('/')[0]
        return domain
    return value

# Variable global temporal
processed_df = None
duplicados = []

@app.route('/upload', methods=['POST'])
def upload_csv():
    global processed_df, duplicados
    file = request.files.get('file') or request.files.get('fileA')
    # Elimina todos los prints de depuración
    cruzar_informacion = request.form.get('cruzarInformacion') == 'true'
    file_b = request.files.get('fileB')
    eliminar_puertos = request.form.get('eliminarPuertos') == 'true'
    quitar_espacios = request.form.get('quitarEspacios') == 'true'
    eliminar_duplicados = request.form.get('eliminarDuplicados') == 'true'
    cruzar_informacion = request.form.get('cruzarInformacion') == 'true'
    if not file:
        return jsonify({'status': 'error', 'message': 'No se envió ningún archivo'}), 400

    if not file.filename.endswith('.csv'):
        return jsonify({'status': 'error', 'message': 'El archivo debe ser formato CSV'}), 400

    file.seek(0, 2)
    size = file.tell()
    file.seek(0)
    if size == 0:
        return jsonify({'status': 'error', 'message': 'El archivo está vacío'}), 400
    if size > MAX_FILE_SIZE:
        return jsonify({'status': 'error', 'message': 'El archivo supera el tamaño máximo permitido (5MB)'}), 400

    try:
        df = pd.read_csv(file, sep=None, engine='python')
    except Exception:
        return jsonify({'status': 'error', 'message': 'No se pudo leer el archivo CSV'}), 400

    normalized = {col.strip().lower() for col in df.columns}
    required_normalized = {col.strip().lower() for col in REQUIRED_COLUMNS}
    missing = required_normalized - normalized
    if missing:
        return jsonify({
            'status': 'error',
            'message': f'Faltan columnas requeridas: {", ".join(missing)}. Columnas detectadas: {", ".join(df.columns)}'
        }), 400

    if eliminar_puertos and 'Resource' in df.columns:
        df['Resource'] = df['Resource'].apply(clean_resource)

    if quitar_espacios:
        for col in df.select_dtypes(include='object').columns:
            df[col] = df[col].apply(lambda x: str(x).strip())

    duplicados = []
    if eliminar_duplicados:
        if '#' in df.columns:
            duplicated_mask = df.duplicated()
            duplicados = df.loc[duplicated_mask, '#'].tolist()
            df = df.drop_duplicates()
        else:
            df = df.drop_duplicates()

    # --- Cruce de información ---
    if cruzar_informacion and file_b:
        try:
            df_b = pd.read_csv(file_b)
            b_col = df_b.columns[0]
            b_values = set(df_b[b_col].astype(str))
            def fila_contiene_valor_b(row):
                return any(str(val) in b_values for val in row)
            df[b_col] = df.apply(lambda row: "Si" if fila_contiene_valor_b(row) else "No", axis=1)
        except Exception:
            return jsonify({'status': 'error', 'message': 'No se pudo procesar el archivo de cruce'}), 400

    processed_df = df

    response = {
        'status': 'success',
        'message': 'Archivo procesado correctamente.',
        'duplicados': duplicados
    }
    return jsonify(response)

@app.route('/vista-previa', methods=['GET'])
def vista_previa():
    global processed_df, duplicados
    if processed_df is None:
        return jsonify({'status': 'error', 'message': 'No hay archivo procesado para mostrar'}), 400
    preview_df = processed_df.head(5).where(pd.notnull(processed_df.head(5)), None)
    preview = preview_df.to_dict(orient='records')
    columns = list(processed_df.columns)
    return jsonify({
        'status': 'success',
        'preview': preview,
        'columns': columns,
        'duplicados': duplicados
    })

@app.route('/vista-previa/download', methods=['GET'])
def descargar_excel():
    global processed_df
    if processed_df is None:
        return jsonify({'status': 'error', 'message': 'No hay archivo procesado para descargar'}), 400

    output = io.BytesIO()
    with pd.ExcelWriter(output, engine='xlsxwriter') as writer:
        processed_df.to_excel(writer, index=False, sheet_name='Procesado')
    output.seek(0)
    return send_file(
        output,
        mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        as_attachment=True,
        download_name='procesado.xlsx'
    )

@app.route('/')
def hello_world():
    return 'Hello, World!'

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)