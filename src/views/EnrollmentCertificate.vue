<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'

const API_URL = '/api/enrollment-certificate/'

const route = useRoute()
const student = ref(null)
const enrollments = ref([])
const loading = ref(true)
const error = ref(null)

const totalCourses = computed(() => enrollments.value.length)

function formatDate(dateStr) {
  if (!dateStr) return new Date().toLocaleDateString('es-PE')
  const d = new Date(dateStr)
  return d.toLocaleDateString('es-PE')
}

const emissionDate = computed(() => {
  if (enrollments.value.length === 0) return formatDate()
  const dates = enrollments.value.map(e => new Date(e.created))
  const latest = new Date(Math.max(...dates))
  return latest.toLocaleDateString('es-PE')
})

async function fetchEnrollments(cui) {
  loading.value = true
  error.value = null
  student.value = null
  enrollments.value = []

  try {
    const { data } = await axios.get(API_URL, {
      params: { cui },
    })

    if (data.results && data.results.length > 0) {
      enrollments.value = data.results
      student.value = data.results[0].student
    } else {
      error.value = `No se encontraron matrículas para el CUI ${cui}`
    }
  } catch (e) {
    error.value = 'Error al conectar con el servidor. Verifique su conexión.'
    console.error('API Error:', e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  const cui = route.params.cui || '20250100'
  fetchEnrollments(cui)
})

watch(() => route.params.cui, (newCui) => {
  if (newCui) fetchEnrollments(newCui)
})
</script>

<template>
  <div class="container">
    <div class="certificate-box">
      <header class="header">
        <h2>CONSTANCIA DE MATRÍCULA DE LABORATORIO</h2>
        <h3>Escuela Profesional de Ingeniería de Sistemas EPIS</h3>
        <p class="date">Emitido el: {{ emissionDate }}</p>
      </header>

      <hr>

      <div v-if="loading" class="loading">Cargando datos del alumno...</div>

      <div v-else-if="error" class="error-message">{{ error }}</div>

      <div v-else-if="!student" class="no-data">
        No se encontraron datos para este estudiante.
      </div>

      <template v-else>
        <section class="section">
          <h4>DATOS DEL ALUMNO</h4>
          <table class="table-info">
            <tbody>
              <tr>
                <td><strong>C.U.I.:</strong></td>
                <td>{{ student.cui }}</td>
              </tr>
              <tr>
                <td><strong>Nombre completo:</strong></td>
                <td>{{ student.full_name }}</td>
              </tr>
              <tr>
                <td><strong>Email:</strong></td>
                <td>{{ student.email }}</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section class="section">
          <h4>ASIGNATURAS MATRICULADAS</h4>
          <table class="table-data">
            <thead>
              <tr>
                <th>N°</th>
                <th>Código</th>
                <th>Curso</th>
                <th>Año</th>
                <th>Grupo</th>
                <th>Laboratorio</th>
                <th>Docente</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(enr, index) in enrollments" :key="enr.id">
                <td>{{ index + 1 }}</td>
                <td>{{ enr.workload.course.code }}</td>
                <td>
                  <strong>{{ enr.workload.course.name }}</strong>
                  ({{ enr.workload.course.acronym }})
                </td>
                <td>{{ enr.workload.course.year_display }}</td>
                <td>{{ enr.workload.group }}</td>
                <td>{{ enr.workload.laboratory }}</td>
                <td>{{ enr.workload.teacher.full_name }}</td>
              </tr>
            </tbody>
          </table>
        </section>

        <footer class="footer">
          <p><strong>Total de cursos matriculados:</strong> {{ totalCourses }}</p>
          <p class="digital-sign">
            Documento generado digitalmente por Josue Enrique Camero Elguera.
          </p>
        </footer>
      </template>
    </div>
  </div>
</template>

<style scoped>
.container {
  color: #333;
  max-width: 900px;
  margin: 30px auto;
  font-family: Arial, sans-serif;
}

.certificate-box {
  background-color: #fff;
  border: 1px solid #ccc;
  padding: 30px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);
}

.header {
  text-align: center;
  margin-bottom: 20px;
}

.header h2 {
  color: #1a4a75;
  margin: 5px 0;
  font-size: 20px;
}

.header h3 {
  color: #555;
  margin: 5px 0;
  font-size: 16px;
}

.date {
  color: #777;
  font-size: 12px;
}

.section {
  margin: 20px 0;
}

.section h4 {
  background-color: #f2f2f2;
  border-left: 4px solid #1a4a75;
  margin-bottom: 10px;
  padding: 6px 10px;
  font-size: 14px;
}

.table-info {
  width: 100%;
  margin-bottom: 15px;
}

.table-info td {
  padding: 5px;
  font-size: 14px;
}

.table-data {
  border-collapse: collapse;
  width: 100%;
  margin-top: 10px;
  font-size: 13px;
}

.table-data th,
.table-data td {
  text-align: left;
  border: 1px solid #ddd;
  padding: 10px;
}

.table-data th {
  background-color: #f9f9f9;
  font-weight: 700;
}

.footer {
  margin-top: 30px;
  font-size: 14px;
}

.digital-sign {
  color: #999;
  text-align: center;
  margin-top: 20px;
  font-size: 11px;
  font-style: italic;
}

.loading,
.error-message,
.no-data {
  text-align: center;
  padding: 40px;
  font-size: 16px;
}

.error-message {
  color: red;
}
</style>
