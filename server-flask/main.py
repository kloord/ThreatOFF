from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import pandas as pd
import re
from urllib.parse import urlparse
import io
from datetime import datetime

app = Flask(__name__)
CORS(app)

REQUIRED_COLUMNS = {
    "#",
    "Status",
    "Priority",
    "Subject",
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

    # Intentamos leer el CSV con varios settings para manejar ';' y diferentes encodings
    try:
        df = pd.read_csv(file, sep=None, engine='python')
    except Exception as e1:
        # primer fallback: punto y coma, UTF-8
        try:
            file.seek(0)
            df = pd.read_csv(file, sep=';', engine='python', encoding='utf-8')
        except Exception as e2:
            # segundo fallback: punto y coma, latin-1
            try:
                file.seek(0)
                df = pd.read_csv(file, sep=';', engine='python', encoding='latin-1')
            except Exception as e3:
                # tercer fallback: intentar saltar líneas malformadas
                try:
                    file.seek(0)
                    df = pd.read_csv(file, sep=';', engine='python', encoding='latin-1', on_bad_lines='skip')
                except Exception as e4:
                    # devolver detalle de error para depuración en el cliente
                    detail = str(e4)
                    return jsonify({'status': 'error', 'message': 'No se pudo leer el archivo CSV', 'detail': detail}), 400

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


@app.route('/dashboard-data', methods=['GET'])
def dashboard_data():
    """
    Devuelve conteos agrupados por valor para las columnas 'Resource' y 'Subject'.
    Retorna top 10 de cada una.
    """
    global processed_df
    if processed_df is None:
        return jsonify({'status': 'error', 'message': 'No hay archivo procesado para mostrar'}), 400

    # Normalizamos nombres de columnas por si llegan en diferentes capitalizaciones
    cols_lower = {c.lower(): c for c in processed_df.columns}
    resource_col = None
    subject_col = None
    for low, orig in cols_lower.items():
        if low == 'resource':
            resource_col = orig
        if low == 'subject':
            subject_col = orig

    if resource_col is None and subject_col is None:
        return jsonify({'status': 'error', 'message': 'No se encontraron columnas Resource ni Subject en el dataset procesado'}), 400

    def top_counts(series, top_n=10):
        if series is None:
            return {}
        s = series.astype(str).str.strip().replace({'': 'Unknown'})
        counts = s.value_counts().head(top_n)
        return counts.to_dict()

    resource_counts = top_counts(processed_df[resource_col]) if resource_col else {}
    subject_counts = top_counts(processed_df[subject_col]) if subject_col else {}

    # priority (Priority column) top counts
    priority_col = None
    for low, orig in cols_lower.items():
        if low == 'priority':
            priority_col = orig

    priority_counts = top_counts(processed_df[priority_col]) if priority_col else {}

    # Tipo de Asset counts
    asset_type_col = None
    for low, orig in cols_lower.items():
        if low == 'tipo de asset':
            asset_type_col = orig
            break
    asset_type_counts = top_counts(processed_df[asset_type_col]) if asset_type_col else {}

    # status (Status column) top counts
    status_col = None
    for low, orig in cols_lower.items():
        if low == 'status':
            status_col = orig

    status_counts = top_counts(processed_df[status_col]) if status_col else {}

    # puntaje ponderado (Puntaje Ponderado column) - contamos SI/NO
    puntaje_col = None
    for low, orig in cols_lower.items():
        if low == 'puntaje ponderado':
            puntaje_col = orig

    puntaje_counts = {}
    if puntaje_col:
        # normalizamos a minúsculas y reemplazamos 'sí' por 'si'
        s = processed_df[puntaje_col].astype(str).str.strip().str.lower().replace({'sí': 'si'})
        counts = s.value_counts()
        si_count = int(counts.get('si', 0))
        no_count = int(counts.get('no', 0))
        puntaje_counts = {'Si': si_count, 'No': no_count}

    # Conteo por mes usando exclusivamente la columna 'Date Found' (formato esperado DD/MM/YYYY)
    month_counts = {}
    date_col = cols_lower.get('date found')
    if date_col:
        try:
            # parseamos con dayfirst=True para DD/MM/YYYY y toleramos errores
            dt = pd.to_datetime(processed_df[date_col], dayfirst=True, errors='coerce')
            # formateamos como 'Mon YYYY' (ej. 'Jun 2025')
            months = dt.dt.strftime('%b %Y').fillna('Unknown')
            counts = months.value_counts().head(5)
            month_counts = counts.to_dict()
        except Exception:
            month_counts = {}

    return jsonify({
        'status': 'success',
        'resource_counts': resource_counts,
        'subject_counts': subject_counts
        , 'priority_counts': priority_counts,
        'status_counts': status_counts,
        'asset_type_counts': asset_type_counts,
        'puntaje_counts': puntaje_counts
        , 'month_counts': month_counts
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
    # Build dynamic filename: informeThreatOFF_DD_MM_AAAA.xlsx
    today_str = datetime.now().strftime('%d_%m_%Y')
    download_filename = f'informeThreatOFF_{today_str}.xlsx'
    return send_file(
        output,
        mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        as_attachment=True,
        download_name=download_filename
    )

@app.route('/')
def hello_world():
    return 'Hello, World!'

if __name__ == "__main__":
    # Asegura que el contenedor escuche correctamente
    app.run(host="0.0.0.0", port=5000)