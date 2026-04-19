import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

// Shared
import { CartProvider } from './shared/context/CartContext'
import ConnectionStatus from './shop/components/ConnectionStatus'

// Shop Components
import Navbar from './shop/components/Navbar'
import Footer from './shop/components/Footer'
import FloatingButtons from './shop/components/FloatingButtons'

// Shop Pages
import Home from './shop/pages/Home'
import ShopProducts from './shop/pages/Products'
import ProductDetail from './shop/pages/ProductDetail'
import Cart from './shop/pages/Cart'
import Checkout from './shop/pages/Checkout'
import Contact from './shop/pages/Contact'

// Admin Components
import AdminSidebar from './admin/components/Sidebar'
import ProtectedRoute from './admin/components/ProtectedRoute'

// Admin Pages
import AdminLogin from './admin/pages/Login'
import AdminDashboard from './admin/pages/Dashboard'
import AdminProducts from './admin/pages/Products'
import ProductForm from './admin/pages/ProductForm'
import AdminCategories from './admin/pages/Categories'
import CategoryForm from './admin/pages/CategoryForm'
import Sizes from './admin/pages/Sizes'
import SizeForm from './admin/pages/SizeForm'
import Colors from './admin/pages/Colors'
import ColorForm from './admin/pages/ColorForm'
import Orders from './admin/pages/Orders'
import ContactMessages from './admin/pages/ContactMessages'
import Settings from './admin/pages/Settings'

function App() {
  return (
    <CartProvider>
      <Router>
        <div className="min-h-screen bg-white">
          <Toaster position="top-right" />
          <Routes>
            {/* Shop Routes */}
            <Route
              path="/*"
              element={
                <>
                  <ConnectionStatus />
                  <Navbar />
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/products" element={<ShopProducts />} />
                    <Route path="/products/:id" element={<ProductDetail />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/contact" element={<Contact />} />
                  </Routes>
                  <Footer />
                  <FloatingButtons />
                </>
              }
            />

            {/* Admin Login */}
            <Route path="/login" element={<AdminLogin />} />

            {/* Admin Routes */}
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute>
                  <div className="flex">
                    <AdminSidebar />
                    <div className="flex-1 ml-64 p-8">
                      <Routes>
                        <Route path="dashboard" element={<AdminDashboard />} />
                        <Route path="products" element={<AdminProducts />} />
                        <Route path="products/new" element={<ProductForm />} />
                        <Route path="products/edit/:id" element={<ProductForm />} />
                        <Route path="categories" element={<AdminCategories />} />
                        <Route path="categories/new" element={<CategoryForm />} />
                        <Route path="categories/edit/:id" element={<CategoryForm />} />
                        <Route path="sizes" element={<Sizes />} />
                        <Route path="sizes/new" element={<SizeForm />} />
                        <Route path="sizes/edit/:id" element={<SizeForm />} />
                        <Route path="colors" element={<Colors />} />
                        <Route path="colors/new" element={<ColorForm />} />
                        <Route path="colors/edit/:id" element={<ColorForm />} />
                        <Route path="orders" element={<Orders />} />
                        <Route path="contact-messages" element={<ContactMessages />} />
                        <Route path="settings" element={<Settings />} />
                        <Route path="*" element={<Navigate to="dashboard" replace />} />
                      </Routes>
                    </div>
                  </div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </CartProvider>
  )
}

export default App

