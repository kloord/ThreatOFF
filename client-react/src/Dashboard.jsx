import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Home } from "lucide-react";
import { Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";
import 'bootstrap/dist/css/bootstrap.min.css';
import './FileUpload.css';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

function genColors(n) {
  const base = [
    "#2f80ed", "#f2994a", "#27ae60", "#9b51e0", "#eb5757",
    "#56ccf2", "#6fcf97", "#f2c94c", "#bdbdbd", "#2d9cdb"
  ];
  return Array.from({ length: n }).map((_, i) => base[i % base.length]);
}

export default function Dashboard() {
  const [resourceData, setResourceData] = useState(null);
  const [resourceTop3, setResourceTop3] = useState([]);
  const [priorityData, setPriorityData] = useState(null);
  const [puntajeData, setPuntajeData] = useState(null);
  const [subjectData, setSubjectData] = useState(null);
  const [monthData, setMonthData] = useState(null);
  const [subjectTop3, setSubjectTop3] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_URL}/dashboard-data`)
      .then((r) => r.json())
      .then((data) => {
        if (data.status === "success") {
          const rc = data.resource_counts || {};
          const sc = data.subject_counts || {};
          const pc = data.priority_counts || {};

          // Prepare top 10 for pie slices and remember top 3 for the legend
          const rcEntries = Object.entries(rc || {}).map(([k, v]) => [k, Number(v)]);
          rcEntries.sort((a, b) => b[1] - a[1]);
          const rcTop10 = rcEntries.slice(0, 10);
          const rcTop3 = rcEntries.slice(0, 3);
          setResourceData({
            labels: rcTop10.map(r => r[0]),
            datasets: [{
              data: rcTop10.map(r => r[1]),
              backgroundColor: genColors(rcTop10.length),
            }],
          });
          setResourceTop3(rcTop3.map(r => r[0]));

          // Prepare top 10 for pie slices and remember top 3 for the legend
          const scEntries = Object.entries(sc || {}).map(([k, v]) => [k, Number(v)]);
          scEntries.sort((a, b) => b[1] - a[1]);
          const scTop10 = scEntries.slice(0, 10);
          const scTop3 = scEntries.slice(0, 3);
          setSubjectData({
            labels: scTop10.map(s => s[0]),
            datasets: [{
              data: scTop10.map(s => s[1]),
              backgroundColor: genColors(scTop10.length),
            }],
          });
          setSubjectTop3(scTop3.map(s => s[0]));

          // priority bar
          // Normalize priority counts and force desired order
          const desiredOrder = ['Critical', 'High', 'Medium', 'Low', 'Informational'];
          // build a case-insensitive map from api data
          const pcMap = {};
          Object.entries(pc).forEach(([k, v]) => {
            pcMap[String(k).trim().toLowerCase()] = Number(v) || 0;
          });
          const priorityCountsOrdered = desiredOrder.map(label => pcMap[label.toLowerCase()] || 0);
          setPriorityData({
            labels: desiredOrder,
            datasets: [{
              label: 'Cantidad',
              data: priorityCountsOrdered,
              backgroundColor: genColors(desiredOrder.length),
            }],
          });

          // puntaje ponderado (Si / No)
          const pt = data.puntaje_counts || {};
          setPuntajeData({
            labels: Object.keys(pt),
            datasets: [{
              label: 'Cantidad',
              data: Object.values(pt),
              backgroundColor: genColors(Object.keys(pt).length || 2),
            }],
          });

          // meses top 5
          const mc = data.month_counts || {};
          setMonthData({
            labels: Object.keys(mc),
            datasets: [{
              label: 'Vulnerabilidades',
              data: Object.values(mc),
              backgroundColor: genColors(Object.keys(mc).length || 5),
            }],
          });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="fileupload-center" style={{ backgroundColor: '#fff', minHeight: "100%", paddingTop: '100px', paddingBottom: '100px', paddingLeft: '20px', paddingRight: '20px', boxSizing: 'border-box', overflowX: 'hidden' }}>
        <div className="card shadow-lg rounded-4 p-4" style={{ width: "100%", maxWidth: "1100px", boxSizing: "border-box", margin: '0 auto' }}>
          Cargando datos del dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="fileupload-center" style={{ backgroundColor: '#fff', minHeight: "100%", paddingTop: '100px', paddingBottom: '100px', paddingLeft: '20px', paddingRight: '20px', boxSizing: 'border-box', overflowX: 'hidden' }}>
      <div className="card shadow-lg rounded-4 p-4" style={{ width: "100%", maxWidth: "1100px", boxSizing: "border-box", margin: '0 auto' }}>
        <div className="d-flex align-items-center justify-content-between mb-2">
          <div>
            <h2 className="mb-0">Dashboard de Visualización</h2>
            <p className="mb-0 text-muted">Distribución por Resource y por Subjet (top valores).</p>
          </div>
          <div className="d-flex align-items-center" style={{ gap: 10 }}>
            <button
              className="btn download-anim-btn"
              onClick={() => navigate('/vista-previa')}
              style={{
                backgroundColor: "#393E46",
                color: "#fff",
                fontSize: "0.95rem",
                padding: "8px 12px",
                borderRadius: "8px",
                border: "none",
                minWidth: "60px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              }}
            >
              Volver
            </button>

            <button
              className="btn btn-outline-primary d-flex align-items-center justify-content-center home-anim-btn"
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                backgroundColor: "white",
                borderColor: "black",
                transition: "transform 0.2s, box-shadow 0.2s",
              }}
              onClick={() => navigate('/')}
              title="Ir al inicio"
            >
              <Home size={22} color="black" />
            </button>
          </div>
        </div>

        <div className="d-flex flex-wrap justify-content-center gap-4" style={{ marginTop: 24, width: '100%' }}>
          <div style={{ width: "100%", minWidth: 320, maxWidth: 420, boxSizing: 'border-box' }}>
            <h5 className="text-center">Resource (top)</h5>
            {resourceData && (
              <Pie
                data={resourceData}
                options={{
                  plugins: {
                    legend: {
                      labels: {
                        // show only top 3 in legend
                        filter: function (legendItem, chartData) {
                          return resourceTop3.includes(legendItem.text);
                        }
                      }
                    }
                  }
                }}
              />
            )}
          </div>

          <div style={{ width: "100%", minWidth: 320, maxWidth: 420, boxSizing: 'border-box' }}>
            <h5 className="text-center">Subjet (top)</h5>
            {subjectData && (
              <Pie
                data={subjectData}
                options={{
                  plugins: {
                    legend: {
                      labels: {
                        filter: function (legendItem, chartData) {
                          return subjectTop3.includes(legendItem.text);
                        }
                      }
                    }
                  }
                }}
              />
            )}
          </div>
        </div>
        {/* Gráfico de barras de prioridades */}
        <div style={{ marginTop: 24, width: '100%', boxSizing: 'border-box' }}>
          <div style={{ width: "100%", boxSizing: "border-box", margin: '0 auto' }}>
            <h5 className="text-center">Prioridades (conteo)</h5>
            {priorityData && (
              <Bar
                data={priorityData}
                options={{ plugins: { legend: { display: false } } }}
              />
            )}
          </div>
        </div>
        {/* Gráfico de barras de Puntaje Ponderado (Si / No) */}
        <div style={{ marginTop: 24, width: '100%', boxSizing: 'border-box' }}>
          <div style={{ width: "100%", boxSizing: "border-box", margin: '0 auto' }}>
            <h5 className="text-center">Puntaje Ponderado (Si / No)</h5>
            {puntajeData && (
              <Bar
                data={puntajeData}
                options={{ plugins: { legend: { display: false } } }}
              />
            )}
          </div>
        </div>
        {/* Gráfico de barras Meses (top 5) */}
        <div style={{ marginTop: 24, width: '100%', boxSizing: 'border-box' }}>
          <div style={{ width: "100%", boxSizing: "border-box", margin: '0 auto' }}>
            <h5 className="text-center">Meses con más vulnerabilidades (top 5)</h5>
            {monthData && (
              <Bar
                data={monthData}
                options={{ plugins: { legend: { display: false } } }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
