import '../styles/globals.css'
import { AuthProvider } from '../context/AuthContext'
import { CartProvider } from '../context/CartContext'
import Header from '../components/Header'
import Footer from '../components/Footer'
import ChatWidget from '../components/ChatWidget'
import CartDrawer from '../components/events/CartDrawer'

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <CartProvider>
        <Header />
        <Component {...pageProps} />
        <Footer />
        <ChatWidget />
        <CartDrawer />
      </CartProvider>
    </AuthProvider>
  )
}

export default MyApp
