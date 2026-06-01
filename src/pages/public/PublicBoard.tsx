import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { DIAS_SEMANA, BRAND } from '../../lib/constants'

interface Anuncio {
  id: string; titulo: string; contenido: string; fechaPublicacion: string; fechaExpiracion: string; autorId: string
}

interface Reserva {
  id: string; tituloEvento: string; fechaInicio: string; fechaFin: string; recursoId: string; recursos?: { nombre: string }[]
}

interface Horario {
  id: string; usuarioId: string; diaSemana: number; horaInicio: string; horaFin: string; usuarios?: { nombre: string }[]
}

function formatDate(d: string) {
  if (!d) return ''
  const date = new Date(d)
  return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function formatTime(d: string) {
  if (!d) return ''
  const date = new Date(d)
  return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
}

export function PublicBoard() {
  const [anuncios, setAnuncios] = useState<Anuncio[]>([])
  const [reservas, setReservas] = useState<Reserva[]>([])
  const [horarios, setHorarios] = useState<Horario[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    const today = new Date().toISOString()
    const [aRes, rRes, hRes] = await Promise.all([
      supabase.from('anuncios').select('*').gte('fechaExpiracion', today).order('fechaPublicacion', { ascending: false }),
      supabase.from('reservas').select('*, recursos(nombre)').gte('fechaInicio', today).order('fechaInicio', { ascending: true }).limit(20),
      supabase.from('horarios').select('*, usuarios:usuarioId(nombre)').order('diaSemana').order('horaInicio'),
    ])
    if (aRes.data) setAnuncios(aRes.data)
    if (rRes.data) setReservas(rRes.data)
    if (hRes.data) setHorarios(hRes.data)
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  const horariosPorDia = horarios.reduce<Record<number, Horario[]>>((acc, h) => {
    if (!acc[h.diaSemana]) acc[h.diaSemana] = []
    acc[h.diaSemana].push(h)
    return acc
  }, {})

  const fechaActual = new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div className="text-center border-b border-gray-700 pb-4">
          <h1 className="text-2xl font-bold text-primary-300">{BRAND.name}</h1>
          <p className="text-sm text-gray-400">{BRAND.fullName} · {BRAND.location}</p>
          <p className="text-xs text-gray-500 mt-1 capitalize">{fechaActual}</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* ANUNCIOS */}
            <section>
              <h2 className="text-lg font-semibold text-primary-300 mb-3 flex items-center gap-2">
                <span className="w-1 h-5 bg-primary-500 rounded-full" /> Anuncios
              </h2>
              {anuncios.length === 0 ? (
                <p className="text-sm text-gray-500 italic">No hay anuncios disponibles.</p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {anuncios.map(a => (
                    <div key={a.id} className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                      <h3 className="font-medium text-gray-100">{a.titulo}</h3>
                      <p className="text-sm text-gray-400 mt-1 line-clamp-3">{a.contenido}</p>
                      <p className="text-xs text-gray-500 mt-2">Publicado: {formatDate(a.fechaPublicacion)}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* HORARIOS DEL PERSONAL */}
            <section>
              <h2 className="text-lg font-semibold text-primary-300 mb-3 flex items-center gap-2">
                <span className="w-1 h-5 bg-primary-500 rounded-full" /> Horarios del Personal
              </h2>
              {horarios.length === 0 ? (
                <p className="text-sm text-gray-500 italic">No hay horarios registrados.</p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3, 4, 5, 6, 7].map(dia => {
                    const diaHorarios = horariosPorDia[dia]
                    if (!diaHorarios) return null
                    const diaNombre = DIAS_SEMANA.find(d => d.id === dia)?.nombre
                    return (
                      <div key={dia} className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                        <h3 className="font-medium text-gray-100 mb-2">{diaNombre}</h3>
                        <ul className="space-y-1.5">
                          {diaHorarios.map(h => (
                            <li key={h.id} className="text-sm text-gray-300 flex justify-between">
                              <span>{h.usuarios?.[0]?.nombre || 'Personal'}</span>
                              <span className="text-gray-400">{h.horaInicio} - {h.horaFin}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )
                  })}
                </div>
              )}
            </section>

            {/* RESERVAS */}
            <section>
              <h2 className="text-lg font-semibold text-primary-300 mb-3 flex items-center gap-2">
                <span className="w-1 h-5 bg-primary-500 rounded-full" /> Próximas Reservas
              </h2>
              {reservas.length === 0 ? (
                <p className="text-sm text-gray-500 italic">No hay reservas próximas.</p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {reservas.map(r => (
                    <div key={r.id} className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-medium text-gray-100">{r.tituloEvento}</h3>
                          <p className="text-sm text-gray-400">{r.recursos?.[0]?.nombre || 'Recurso'}</p>
                        </div>
                        <span className="text-xs bg-primary-900/50 text-primary-300 px-2 py-0.5 rounded-full whitespace-nowrap">
                          {formatDate(r.fechaInicio)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        {formatTime(r.fechaInicio)} - {formatTime(r.fechaFin)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        <p className="text-center text-xs text-gray-600 pb-4">
          Datos actualizados cada 30 segundos · {BRAND.name} v{BRAND.version}
        </p>
      </div>
    </div>
  )
}
