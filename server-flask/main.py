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
    file = request.files.get('file')
    if not file:
        return jsonify({'status': 'error', 'message': 'No se envió ningún archivo'}), 400

    # Recibe los filtros del frontend
    eliminar_puertos = request.form.get('eliminarPuertos') == 'true'
    quitar_espacios = request.form.get('quitarEspacios') == 'true'
    eliminar_duplicados = request.form.get('eliminarDuplicados') == 'true'
    cruzar_informacion = request.form.get('cruzarInformacion') == 'true'

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

    # Normaliza nombres de columnas
    normalized = {col.strip().lower() for col in df.columns}
    required_normalized = {col.strip().lower() for col in REQUIRED_COLUMNS}
    missing = required_normalized - normalized
    if missing:
        return jsonify({
            'status': 'error',
            'message': f'Faltan columnas requeridas: {", ".join(missing)}. Columnas detectadas: {", ".join(df.columns)}'
        }), 400

    # Limpieza de la columna Resource SOLO si eliminar_puertos está activo
    if eliminar_puertos and 'Resource' in df.columns:
        df['Resource'] = df['Resource'].apply(clean_resource)

    # Quitar espacios redundantes (inicio y fin) en todas las columnas tipo texto SOLO si quitar_espacios está activo
    if quitar_espacios:
        for col in df.select_dtypes(include='object').columns:
            df[col] = df[col].apply(lambda x: str(x).strip())

    # Eliminar filas duplicadas y guardar los números (#) eliminados SOLO si eliminar_duplicados está activo
    duplicados = []
    if eliminar_duplicados:
        if '#' in df.columns:
            duplicated_mask = df.duplicated()
            duplicados = df.loc[duplicated_mask, '#'].tolist()
            df = df.drop_duplicates()
        else:
            df = df.drop_duplicates()

    # Si cruzar_informacion está activo, aquí podrías agregar la lógica correspondiente
    # if cruzar_informacion:
    #     ...tu lógica...

    # Guarda el DataFrame procesado en memoria
    processed_df = df

    # Respuesta con resumen
    response = {
        'status': 'success',
        'message': 'Archivo procesado correctamente.',
        'duplicados': duplicados
    }
    # Aquí puedes guardar df en memoria para la vista previa si lo necesitas

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
def descargar_csv():
    global processed_df
    if processed_df is None:
        return jsonify({'status': 'error', 'message': 'No hay archivo procesado para descargar'}), 400

    output = io.StringIO()
    processed_df.to_csv(output, index=False)
    output.seek(0)
    return send_file(
        io.BytesIO(output.getvalue().encode()),
        mimetype='text/csv',
        as_attachment=True,
        download_name='procesado.csv'
    )

@app.route('/')
def hello_world():
    return 'Hello, World!'

if __name__ == '__main__':
    app.run(debug=True)