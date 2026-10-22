import {
  Chart, CategoryScale, LinearScale, LogarithmicScale, PointElement, LineElement,
  BarElement, ArcElement, RadialLinearScale, Filler, Tooltip, Legend,
} from 'chart.js'

Chart.register(CategoryScale, LinearScale, LogarithmicScale, PointElement, LineElement,
  BarElement, ArcElement, RadialLinearScale, Filler, Tooltip, Legend)

Chart.defaults.color = '#e6e6ea'
Chart.defaults.font.family = 'Poppins, system-ui, sans-serif'
Chart.defaults.font.weight = 600
Chart.defaults.borderColor = '#1a1a20'

export const grid = { color: '#1a1a20', borderDash: [3, 3] }
export const baseOpts = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } } as const