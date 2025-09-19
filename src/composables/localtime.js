 export const getMexicoLocalString = () => {
  // Para mayor control, usamos Intl.DateTimeFormat con "timeZone"
  const options = {
    timeZone: "America/Mexico_City",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  };

  const formatter = new Intl.DateTimeFormat("en-CA", options);
  const parts = formatter.formatToParts(new Date());

  let year = "";
  let month = "";
  let day = "";
  let hour = "";
  let minute = "";
  let second = "";

  // Recorremos cada parte y guardamos su valor
  for (const part of parts) {
    switch (part.type) {
      case "year":
        year = part.value;
        break;
      case "month":
        month = part.value;
        break;
      case "day":
        day = part.value;
        break;
      case "hour":
        hour = part.value;
        break;
      case "minute":
        minute = part.value;
        break;
      case "second":
        second = part.value;
        break;
    }
  }

  // Formato final: "YYYY-MM-DD HH:mm:ss"
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
};