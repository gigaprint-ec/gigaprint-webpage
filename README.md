# 🚀 Gigaprint — Tus ideas en grande

> Plataforma comercial de publicidad exterior, gigantografías, rotulación y sistema ERP / POS de taller publicitario.

[![Deploy to GitHub Pages](https://github.com/gigaprint-ec/gigaprint-webpage/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/gigaprint-ec/gigaprint-webpage/actions/workflows/deploy-pages.yml)
[![Live Demo](https://img.shields.io/badge/Sitio_Online-gigaprint--ec.github.io-ea580c?style=flat&logo=google-chrome)](https://gigaprint-ec.github.io/gigaprint-webpage/)

---

## 🌟 Características Principales

### 🌐 Frente Público & Comercial
- **Catálogo Inteligente de Soluciones:** Gran Formato (Lonas, Viniles, Microperforado), Rótulos 3D, Cajas de Luz, Textil & Sublimación, Neón LED y Papelería.
- **Cotizador Multivariable:** Cálculo en vivo por $m^2$ (Ancho × Alto cm), unidades, lotes, escalas de volumen, acabados (ojetes, dobladillo) e instalación en sitio.
- **Seguimiento Público de Pedidos:** Rastreo de estado de producción mediante código QR impreso en el ticket o PIN de seguridad.
- **Carrito de Cotizaciones:** Guardado local de solicitudes con envío directo a asesores por WhatsApp.

### 🏢 ERP, Punto de Venta (POS) & Taller Multi-Rol
- **Terminal de Cobranza Rápida (POS Mostrador):** Cobro multi-pago (Efectivo, Transferencia Banco Pichincha, Tarjeta, DeUna, Crédito), ventas en espera e impresión térmica de 80mm/58mm.
- **Cartelera Semanal de Taller (Master Dispatcher):** Planificación de lunes a sábado con conmutador de *Fecha de Fabricación* vs *Fecha de Instalación en Sitio*, WhatsApp directo con clientes y descarga de vectores.
- **Estaciones de Trabajo Táctiles (3 Estados):** Tableros dedicados con checklist por ítem para **🖨️ Impresión**, **👕 Sublimación & DTF** y **⚡ Corte Láser & CNC**.
- **CRM de Clientes & Cuentas por Cobrar:** Matriz de antigüedad de saldos (15d/30d/+60d), alertas de crédito y bitácora comercial.
- **Arqueo de Caja & Cuadre Semanal:** Arqueo ciego con cálculo automático de faltantes/sobrantes, caja chica y exportación a Excel.
- **Facturación Electrónica SRI:** Generación de Clave de Acceso estándar de 49 dígitos (Módulo 11), validación de RUC/Cédula y cálculo de IVA 15%/0%.

---

## 🚀 Inicio Rápido

```bash
# 1. Clonar el repositorio
git clone https://github.com/gigaprint-ec/gigaprint-webpage.git
cd gigaprint-webpage

# 2. Instalar dependencias
npm install

# 3. Iniciar el servidor local de desarrollo
npm run dev

# 4. Compilar para producción
npm run build
```

El sitio se despliega automáticamente en **GitHub Pages** al hacer `push` a la rama `main`.

---

## 🧭 Mapa de Rutas

| Tipo | Ruta | Descripción |
| :--- | :--- | :--- |
| **Pública** | `/` | Página principal de la marca y servicios |
| **Pública** | `/tienda` | Catálogo de productos y fichas técnicas |
| **Pública** | `/cotizador` | Cotizador inteligente interactivo |
| **Pública** | `/rastreo/:token` | Seguimiento público de orden con QR |
| **Pública** | `/carrito` | Carrito de cotizaciones del cliente |
| **POS** | `/admin/pos` | Terminal de punto de venta y cobro |
| **Taller** | `/admin/taller` | Cartelera semanal de despacho y montaje |
| **Taller** | `/admin/estaciones` | Estaciones de Impresión, Sublimación y Láser |
| **CRM** | `/admin/crm` | Gestión de clientes y cartera vencida |
| **Finanzas** | `/admin/pos/dashboard` | Cuadre semanal y arqueo de caja |
| **Inventario** | `/admin/inventario` | Stock de bobinas, tintas y mermas |
| **Admin** | `/admin/equipo` | Asesoras, metas y roles RBAC |
| **CMS** | `/admin/contenido` | Editor de textos del sitio público |

---

## 📚 Documentación Técnica

Para consultar la arquitectura profunda, modelos de datos y manual de operaciones:
- 📖 [PROJECT_COMPLETE_SUMMARY.md](PROJECT_COMPLETE_SUMMARY.md) — Resumen maestro y arquitectura del sistema.
- 📋 [AGENTS.md](AGENTS.md) — Guía rápida de desarrollo y convenciones.
- 🗄️ [supabase/schema_pos_complete.sql](supabase/schema_pos_complete.sql) — Esquema SQL consolidado de base de datos.
