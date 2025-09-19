import dayjs from 'dayjs'
import 'dayjs/locale/es'
import utc from 'dayjs/plugin/utc'
import relativeTime from 'dayjs/plugin/relativeTime'
import customParseFormat from 'dayjs/plugin/customParseFormat'

dayjs.extend(utc)
dayjs.extend(relativeTime)
dayjs.extend(customParseFormat)
dayjs.locale('es')

export default function useTime() {
  const formatos = {
    fechaCorta: 'DD/MM/YYYY',
    fechaLarga: 'DD [de] MMMM [de] YYYY',
    fechaHora: 'DD/MM/YYYY HH:mm',
    horaCorta: 'HH:mm',
    mesAnio: 'MMMM YYYY'
  }

  const formatDateWithDay = (dateStr) => {
    const fecha = dayjs(dateStr).utc()
    return fecha.isValid() 
      ? fecha.format('dddd D [de] MMMM [de] YYYY')
      : 'Fecha inválida'
  }

  const formatDate = (dateStr, formato = 'fechaCorta') => {
    const fecha = dayjs(dateStr).utc()
    return fecha.isValid() 
      ? fecha.format(formatos[formato] || formato)
      : 'Fecha inválida'
  }

  const getRelativeTime = (dateStr) => {
    const fecha = dayjs(dateStr).utc()
    if (!fecha.isValid()) return 'Fecha inválida'
    
    const ahora = dayjs().utc()
    const minutosDiff = ahora.diff(fecha, 'minute')

    if (minutosDiff < 1) return 'hace unos segundos'
    if (minutosDiff < 60) return `hace ${minutosDiff} minuto${minutosDiff !== 1 ? 's' : ''}`

    const horasDiff = ahora.diff(fecha, 'hour')
    if (horasDiff < 24) {
      const minutosRestantes = minutosDiff % 60
      const tiempo = `hace ${horasDiff} hora${horasDiff !== 1 ? 's' : ''}`
      return minutosRestantes > 0 
        ? `${tiempo} y ${minutosRestantes} minuto${minutosRestantes !== 1 ? 's' : ''}`
        : tiempo
    }

    return fecha.fromNow()
  }

  const isToday = (dateStr) => {
    const fecha = dayjs(dateStr).utc()
    return fecha.isValid() && fecha.isSame(dayjs().utc(), 'day')
  }

  const getDateComponents = (dateStr) => {
    const fecha = dayjs(dateStr).utc()
    if (!fecha.isValid()) return null
    return {
      año: fecha.year(),
      mes: fecha.month() + 1,
      dia: fecha.date(),
      hora: fecha.hour(),
      minuto: fecha.minute(),
      segundo: fecha.second(),
      diaSemana: fecha.day()
    }
  }

  /**
   * Devuelve la fecha como: 12/mayo/2025
   */
  const formatFechaLargaConSlash = (dateStr) => {
    const fecha = dayjs(dateStr).utc()
    return fecha.isValid()
      ? `${fecha.format('DD')}/${fecha.format('MMMM')}/${fecha.format('YYYY')}`
      : 'Fecha inválida'
  }

  /**
   * Devuelve la hora exacta como: 14:06:45
   */
  const formatHoraCompleta = (dateStr) => {
    const fecha = dayjs(dateStr).utc()
    return fecha.isValid()
      ? fecha.format('HH:mm:ss')
      : 'Hora inválida'
  }

  return {
    formatDate,
    getRelativeTime,
    formatDateWithDay,
    isToday,
    getDateComponents,
    formatFechaLargaConSlash,
    formatHoraCompleta,
    formatos
  }
}
