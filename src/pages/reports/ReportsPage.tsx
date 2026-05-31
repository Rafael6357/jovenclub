import { useState } from 'react'
import { useAuthStore } from '../../stores/authStore'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Select } from '../../components/ui/Select'
import { FileText, Download } from 'lucide-react'
import {
  reporteHorariosPDF, reporteAnunciosPDF, reporteReservasPDF,
  reporteHorariosCSV, reporteAnunciosCSV, reporteReservasCSV,
  reporteUsuarioHorariosPDF, reporteUsuarioHorariosCSV,
} from '../../services/reportService'

export function ReportsPage() {
  const { usuario, isAdmin } = useAuthStore()
  const [tipo, setTipo] = useState('horarios')
  const [formato, setFormato] = useState('pdf')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const reportTypes = isAdmin()
    ? [
        { value: 'horarios', label: 'Reporte de Horarios del Personal' },
        { value: 'anuncios', label: 'Reporte de Anuncios' },
        { value: 'reservas', label: 'Reporte de Reservas de Recursos' },
      ]
    : [
        { value: 'mi_horario', label: 'Mi Horario Personal' },
      ]

  const handleGenerate = async () => {
    setError('')
    setLoading(true)
    try {
      if (tipo === 'mi_horario' && formato === 'pdf') await reporteUsuarioHorariosPDF(usuario!.id)
      else if (tipo === 'mi_horario' && formato === 'csv') await reporteUsuarioHorariosCSV(usuario!.id)
      else if (tipo === 'horarios' && formato === 'pdf') await reporteHorariosPDF()
      else if (tipo === 'horarios' && formato === 'csv') await reporteHorariosCSV()
      else if (tipo === 'anuncios' && formato === 'pdf') await reporteAnunciosPDF()
      else if (tipo === 'anuncios' && formato === 'csv') await reporteAnunciosCSV()
      else if (tipo === 'reservas' && formato === 'pdf') await reporteReservasPDF()
      else if (tipo === 'reservas' && formato === 'csv') await reporteReservasCSV()
    } catch (e: any) {
      setError(e?.message || 'Error al generar el reporte.')
    }
    setLoading(false)
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-100">Reportes de Gestión</h1>
      {error && <div className="bg-red-900/30 text-red-300 text-sm p-3 rounded-lg">{error}</div>}
      <Card>
        <div className="space-y-4">
          <Select
            id="tipo" label="Tipo de reporte"
            value={tipo}
            onChange={e => setTipo(e.target.value)}
            options={reportTypes}
          />
          <Select
            id="formato" label="Formato de exportación"
            value={formato}
            onChange={e => setFormato(e.target.value)}
            options={[
              { value: 'pdf', label: 'PDF' },
              { value: 'csv', label: 'CSV (Excel)' },
            ]}
          />
          <Button onClick={handleGenerate} loading={loading} icon={<Download className="w-4 h-4" />}>
            Generar Reporte
          </Button>
        </div>
      </Card>

    </div>
  )
}
