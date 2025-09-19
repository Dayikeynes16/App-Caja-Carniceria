import { createMemoryHistory, createRouter } from 'vue-router'

import HelloWorld from './components/HelloWorld.vue'
import inicio from './pages/inicio.vue'
import pagina2 from './pages/pagina2.vue'
import Login from './components/HelloWorld.vue'  // Asegúrate de importar tu login
import Inventario from './pages/Inventario.vue'
import ventas from './pages/ventas/ventas.vue'
import totalVentas from './pages/ventas/totalVentas.vue'
import ventasBusqueda from './pages/ventas/ventasBusqueda.vue'
import insertarVenta from './pages/ventas/insertarVenta.vue'
import clientes from './pages/clientes/clientes.vue'
import clientesDetalles from './pages/clientes/clientesDetalles.vue'
import ventaEspecifica from './pages/ventaEspecifica/ventaEspecificaFinal.vue'
import busqueda from './pages/busquedas/main.vue'
import productos from './pages/productos/productos.vue'
import pagos from './pages/pagos/pagos.vue'

const routes = [
  { path: '/', redirect: '/ventas' },  
  { path: '/login', component: Login },
  { path: '/inicio', component: inicio, meta: { requiresAuth: false } },  
  { path: '/pagina2', component: pagina2, meta: { requiresAuth: false }, name: 'login' }, // Ruta protegida
  { path: '/clientes', component: clientes, meta: { requiresAuth: false }},
  { path: '/ventas', component: ventas, meta: { requiresAuth: false }},
  { path: '/totalVentas', component: ventasBusqueda, meta: { requiresAuth: false }}, 
  { path: '/insertarVenta', component: insertarVenta, meta: { requiresAuth: false }},
  { path: '/clientesDetalles/:id', name: 'clientesDetalles' ,component: clientesDetalles, meta: { requiresAuth: false }}, 
  { path: '/ventaEspecifica/:id', name: 'ventaEspecifica' ,component: ventaEspecifica, meta: { requiresAuth: false }}, 
  { path: '/busqueda', name: 'busqueda' ,component: busqueda, meta: { requiresAuth: false }}, 
  { path: '/productos', name: 'productos' ,component: productos, meta: { requiresAuth: false }}, 
  {path: '/pagos', name: 'pagos', component: pagos, meta: { requiresAuth: false }},



]

const router = createRouter({
  history: createMemoryHistory(),
  routes,
})

// Guard para proteger rutas
router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem("access");  // Verifica si hay un token

  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login');  // Redirigir al login si no está autenticado
  } else {
    next();  // Permitir el acceso
  }
});

export { router };
