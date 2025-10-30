import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";
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
import './theme.css';

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

          const desiredOrder = ['Critical', 'High', 'Medium', 'Low', 'Informational'];

          const pcMap = {};
          Object.entries(pc).forEach(([k, v]) => {
            pcMap[String(k).trim().toLowerCase()] = Number(v) | 0;
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
      <div className="page-wrapper">
        <div className="page-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div className="spinner"></div>
            <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Cargando datos del dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="page-content">
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header Section */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--spacing-xl)', borderBottom: '1px solid var(--border-color)', paddingBottom: 'var(--spacing-lg)' }}>
          <div>
            <h1 style={{ marginBottom: 'var(--spacing-xs)', color: 'var(--text-primary)' }}>Dashboard de Vulnerabilidades</h1>
            <p style={{ marginBottom: 0, color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>Análisis visual de distribución por Resource, Subject, Prioridades y Puntaje</p>
          </div>
          <div style={{ display: 'flex', gap: 'var(--spacing-md)', alignItems: 'center' }}>
            <button
              className="btn-secondary"
              onClick={() => navigate('/vista-previa')}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <ArrowLeft size={18} />
              Volver
            </button>
            <button
              className="btn-icon"
              onClick={() => navigate('/')}
              title="Ir al inicio"
            >
              <Home size={20} />
            </button>
          </div>
        </div>

  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: 'var(--spacing-lg)', marginBottom: 'var(--spacing-lg)' }}>
          {/* Resource Grafico de torta */}
          <div className="card">
            <div className="card-inner">
            <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: 'var(--spacing-md)', marginBottom: 'var(--spacing-md)' }}>
              <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Resource (top 10)</h3>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', margin: 'var(--spacing-xs) 0 0' }}>Distribución de vulnerabilidades por recurso</p>
            </div>
            <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {resourceData && (
                <div style={{ width: '100%', height: '100%' }}>
                  <Pie
                    data={resourceData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom',
                          labels: {
                            boxWidth: 12,
                            padding: 12,
                            font: { size: 12 },
                            color: 'var(--text-primary)',
                            filter: function (legendItem) {
                              return resourceTop3.includes(legendItem.text);
                            }
                          }
                        }
                      }
                    }}
                  />
                </div>
              )}
            </div>
            </div>
          </div>

          {/* Subject grafico de torta */}
          <div className="card">
            <div className="card-inner">
            <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: 'var(--spacing-md)', marginBottom: 'var(--spacing-md)' }}>
              <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Subject (top 10)</h3>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', margin: 'var(--spacing-xs) 0 0' }}>Distribución de vulnerabilidades por asunto</p>
            </div>
            <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {subjectData && (
                <div style={{ width: '100%', height: '100%' }}>
                  <Pie
                    data={subjectData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom',
                          labels: {
                            boxWidth: 12,
                            padding: 12,
                            font: { size: 12 },
                            color: 'var(--text-primary)',
                            filter: function (legendItem) {
                              return subjectTop3.includes(legendItem.text);
                            }
                          }
                        }
                      }
                    }}
                  />
                </div>
              )}
            </div>
            </div>
          </div>
        </div>

        {/* Priority grafico */}
  <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
          <div className="card-inner">
          <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: 'var(--spacing-md)', marginBottom: 'var(--spacing-md)' }}>
            <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Prioridades (conteo)</h3>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', margin: 'var(--spacing-xs) 0 0' }}>Distribución de vulnerabilidades por nivel de prioridad</p>
          </div>
          <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {priorityData && (
              <div style={{ width: '100%', height: '100%' }}>
                <Bar
                  data={priorityData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                      y: {
                        ticks: { color: 'var(--text-muted)', font: { size: 12 } },
                        grid: { color: 'var(--border-color)' }
                      },
                      x: {
                        ticks: { color: 'var(--text-muted)', font: { size: 12 } },
                        grid: { display: false }
                      }
                    }
                  }}
                />
              </div>
            )}
          </div>
          </div>
        </div>

        {/* Puntaje Ponderado grafico */}
  <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
          <div className="card-inner">
          <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: 'var(--spacing-md)', marginBottom: 'var(--spacing-md)' }}>
            <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Puntaje Ponderado (Si / No)</h3>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', margin: 'var(--spacing-xs) 0 0' }}>Distribución de vulnerabilidades según estado de puntaje</p>
          </div>
          <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {puntajeData && (
              <div style={{ width: '100%', height: '100%' }}>
                <Bar
                  data={puntajeData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                      y: {
                        ticks: { color: 'var(--text-muted)', font: { size: 12 } },
                        grid: { color: 'var(--border-color)' }
                      },
                      x: {
                        ticks: { color: 'var(--text-muted)', font: { size: 12 } },
                        grid: { display: false }
                      }
                    }
                  }}
                />
              </div>
            )}
          </div>
          </div>
        </div>

        {/* Meses con mas vuln */}
  <div className="card">
          <div className="card-inner">
          <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: 'var(--spacing-md)', marginBottom: 'var(--spacing-md)' }}>
            <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Meses con más vulnerabilidades (top 5)</h3>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', margin: 'var(--spacing-xs) 0 0' }}>Tendencia temporal de vulnerabilidades</p>
          </div>
          <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {monthData && (
              <div style={{ width: '100%', height: '100%' }}>
                <Bar
                  data={monthData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                      y: {
                        ticks: { color: 'var(--text-muted)', font: { size: 12 } },
                        grid: { color: 'var(--border-color)' }
                      },
                      x: {
                        ticks: { color: 'var(--text-muted)', font: { size: 12 } },
                        grid: { display: false }
                      }
                    }
                  }}
                />
              </div>
            )}
          </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
