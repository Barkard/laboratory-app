# Explicación del Contador: Resultados Pendientes

Este documento detalla la lógica utilizada para calcular el contador de **"Resultados Pendientes"** que se muestra en el dashboard principal del sistema de laboratorio.

## ¿Qué refleja este contador?

El número mostrado representa el total de **citas agendadas** que están a la espera de que se les carguen resultados.

## Lógica Técnica (Reglas de Negocio)

Para que una cita sea sumada a este contador, debe cumplir con la siguiente condición:

1.  **Estado de la Cita:** La cita debe estar en estado **`AGENDADA`**. 
    *   *Nota:* Las citas en estado `PENDIENTE` (esperando aprobación) o `COMPLETADA` (ya con resultados procesados) no se cuentan aquí.

## Ejemplo Práctico

Si un paciente tiene una cita **Agendada** para el día de hoy con 3 exámenes (Hematología, Orina y Glucosa):
*   Si no se ha subido ningún resultado, el contador marcará **+3**.
*   Si el bioanalista sube el resultado de Hematología, el contador bajará a **2** (quedando pendientes Orina y Glucosa).
*   Una vez que se suban los 3 resultados, la cita pasará internamente a estar completa para este contador y sumará **0**.

---
*Este documento fue generado para aclarar el funcionamiento de las estadísticas del sistema.*
