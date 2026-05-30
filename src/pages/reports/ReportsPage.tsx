import { useState } from 'react'
import { useAuthStore } from '../../stores/authStore'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Select } from '../../components/ui/Select'
import { FileText, Download } from 'lucide-react'
import {
  reporteHorariosPDF, reporteAnunciosPDF, reporteReservasPDF,
  reporteHorariosCSV, reporteAnunciosCSV, reporteReservasCSV,
  reporteUsuarioHorariosPDF,
} from '../../services/reportService'

export function ReportsPage() {
  const { usuario, isAdmin } = useAuthStore()
  const [tipo, setTipo] = useState('horarios')
  const [formato, setFormato] = useState('pdf')
  const [loading, setLoading] = useState(false)

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
    setLoading(true)
    try {
      if (tipo === 'mi_horario') await reporteUsuarioHorariosPDF(usuario!.id)
      else if (tipo === 'horarios' && formato === 'pdf') await reporteHorariosPDF()
      else if (tipo === 'horarios' && formato === 'csv') await reporteHorariosCSV()
      else if (tipo === 'anuncios' && formato === 'pdf') await reporteAnunciosPDF()
      else if (tipo === 'anuncios' && formato === 'csv') await reporteAnunciosCSV()
      else if (tipo === 'reservas' && formato === 'pdf') await reporteReservasPDF()
      else if (tipo === 'reservas' && formato === 'csv') await reporteReservasCSV()
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900">Reportes de Gestión</h1>
      <Card>
        <div className="space-y-4">
          <Select
            id="tipo" label="Tipo de reporte"
            value={tipo}
            onChange={e => setTipo(e.target.value)}
            options={reportTypes}
          />
          {tipo !== 'mi_horario' && (
            <Select
              id="formato" label="Formato de exportación"
              value={formato}
              onChange={e => setFormato(e.target.value)}
              options={[
                { value: 'pdf', label: 'PDF' },
                { value: 'csv', label: 'CSV (Excel)' },
              ]}
            />
          )}
          <Button onClick={handleGenerate} loading={loading} icon={<Download className="w-4 h-4" />}>
            Generar Reporte
          </Button>
        </div>
      </Card>
      <Card>
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <FileText className="w-4 h-4" /> Información
        </h3>
        <ul className="text-sm text-gray-600 space-y-2">
          <li>• Los reportes se generan a partir de los datos almacenados localmente en IndexedDB</li>
          <li>• Funciona completamente sin conexión a internet</li>
          <li>• Los reportes PDF incluyen encabezado con el nombre del Joven Club</li>
          <li>• Los archivos CSV pueden abrirse en Microsoft Excel o Google Sheets</li>
          {isAdmin() && <li>• Los reportes globales incluyen datos de todo el personal</li>}
          {!isAdmin() && <li>• Como instructor, solo puedes generar reportes de tu propia actividad</li>}
        </ul>
      </Card>
    </div>
  )
}


