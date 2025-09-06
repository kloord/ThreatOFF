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
    # Si es una IP con puerto, elimina el puerto
    ip_port_match = re.match(r'(\d{1,3}(?:\.\d{1,3}){3})(:\d+)?', value)
    if ip_port_match:
        return ip_port_match.group(1)
    # Si es una URL, extrae solo el dominio principal
    if '://' in value or value.startswith('www.'):
        parsed = urlparse(value)
        domain = parsed.netloc if parsed.netloc else parsed.path.split('/')[0]
        # Elimina 'www.' si existe
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

@app.route('/upload', methods=['POST'])
def upload_csv():
    global processed_df
    if 'file' not in request.files:
        return jsonify({'status': 'error', 'message': 'No se envió ningún archivo'}), 400

    file = request.files['file']

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

    # Limpieza de la columna Resource
    if 'Resource' in df.columns:
        df['Resource'] = df['Resource'].apply(clean_resource)

    # Guarda el DataFrame procesado en memoria
    processed_df = df

    return jsonify({'status': 'success', 'message': 'Archivo válido y columna Resource limpiada'}), 200

@app.route('/vista-previa', methods=['GET'])
def vista_previa():
    global processed_df
    if processed_df is None:
        return jsonify({'status': 'error', 'message': 'No hay archivo procesado para descargar'}), 400

    # Convierte el DataFrame a CSV en memoria
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