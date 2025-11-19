import React, { createContext, useContext, useEffect, useState, useRef } from 'react'

const CartContext = createContext(null)

export function useCart(){
  return useContext(CartContext)
}

export function CartProvider({ children }){
  const [cart, setCart] = useState([]) // items: {id,title,price,image,qty}
  const [open, setOpen] = useState(false)
  const [bump, setBump] = useState(false)

  // load from localStorage
  useEffect(()=>{
    try{
      const raw = localStorage.getItem('ignitia_cart')
      if(raw) setCart(JSON.parse(raw))
    }catch(e){}
  },[])

  useEffect(()=>{
    try{ localStorage.setItem('ignitia_cart', JSON.stringify(cart)) }catch(e){}
  },[cart])

  function addToCart(item){
    setCart(prev => {
      const existing = prev.find(i=>i.id===item.id)
      if(existing){
        return prev.map(i=> i.id===item.id ? {...i, qty: (i.qty||1)+1} : i)
      }
      return [...prev, {...item, qty:1}]
    })
    // trigger bump animation (flip state so consumers re-render)
    setBump(v => !v)
  }

  function removeFromCart(id){
    setCart(prev => prev.filter(i=>i.id!==id))
  }

  function updateQty(id, qty){
    setCart(prev => prev.map(i=> i.id===id ? {...i, qty} : i).filter(i=> i.qty>0))
  }

  function clearCart(){ setCart([]) }

  const total = cart.reduce((s,i)=> s + (Number(i.price||0)*(i.qty||1)), 0)

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQty, clearCart, total, open, setOpen, bump }}>
      {children}
    </CartContext.Provider>
  )
}
