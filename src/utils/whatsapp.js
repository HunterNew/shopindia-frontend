// WhatsApp Business Number
export const WHATSAPP_NUMBER = '918277683045';

const STORE_NAME    = 'ShopIndia';
const STORE_WEBSITE = 'https://shopindia-frontend1.vercel.app';

export const formatOrderMessage = (cartItems, subtotal, addr, notes) => {
  const shipping = subtotal >= 500 ? 0 : 49;
  const gst      = +(subtotal * 0.18).toFixed(2);
  const total    = +(subtotal + shipping + gst).toFixed(2);
  const orderRef = 'WA' + Date.now().toString().slice(-6);
  const today    = new Date().toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' });

  const itemLines = cartItems.map((item, i) => {
    const price     = Number(item.price).toLocaleString('en-IN');
    const itemTotal = (item.price * item.quantity).toLocaleString('en-IN');
    return `${i + 1}. *${item.name}*\n   Rs.${price} x ${item.quantity} = *Rs.${itemTotal}*`;
  }).join('\n\n');

  const hasPhysical = cartItems.some(i => i.product_type === 'physical');

  const addressBlock = hasPhysical ? `
-----------------------------
*DELIVERY ADDRESS*
-----------------------------
Name    : ${addr.full_name}
Phone   : +91 ${addr.phone}
Address : ${addr.address_line1}${addr.address_line2 ? ', ' + addr.address_line2 : ''}
City    : ${addr.city}
State   : ${addr.state}
Pincode : ${addr.pincode}` : `
-----------------------------
*CUSTOMER DETAILS*
-----------------------------
Name  : ${addr.full_name}
Phone : +91 ${addr.phone}`;

  return `*NEW ORDER - ${STORE_NAME.toUpperCase()}*
Ref: #${orderRef}
Date: ${today}

-----------------------------
*ORDER ITEMS*
-----------------------------
${itemLines}

-----------------------------
*PRICE SUMMARY*
-----------------------------
Subtotal   : Rs.${subtotal.toLocaleString('en-IN')}
Shipping   : ${shipping === 0 ? 'FREE' : `Rs.${shipping}`}
GST (18%)  : Rs.${gst}

*TOTAL AMOUNT : Rs.${total.toLocaleString('en-IN')}*
${addressBlock}
${notes ? `\nNotes      : ${notes}` : ''}
-----------------------------
Please *confirm this order* and share your preferred payment:
- Cash on Delivery (COD)
- UPI / PhonePe / GPay

${STORE_WEBSITE}
-----------------------------`;
};

export const sendOrderViaWhatsApp = (cartItems, subtotal, addr, notes = '') => {
  const message = formatOrderMessage(cartItems, subtotal, addr, notes);
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');
};

export const orderCartViaWhatsApp = (cartItems, subtotal) => {
  const shipping = subtotal >= 500 ? 0 : 49;
  const gst      = +(subtotal * 0.18).toFixed(2);
  const total    = +(subtotal + shipping + gst).toFixed(2);
  const orderRef = 'WA' + Date.now().toString().slice(-6);
  const today    = new Date().toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' });

  const itemLines = cartItems.map((item, i) => {
    const price     = Number(item.price).toLocaleString('en-IN');
    const itemTotal = (item.price * item.quantity).toLocaleString('en-IN');
    return `${i + 1}. *${item.name}*\n   Rs.${price} x ${item.quantity} = *Rs.${itemTotal}*`;
  }).join('\n\n');

  const message = `*NEW ORDER - ${STORE_NAME.toUpperCase()}*
Ref: #${orderRef}
Date: ${today}

-----------------------------
*ORDER ITEMS*
-----------------------------
${itemLines}

-----------------------------
*PRICE SUMMARY*
-----------------------------
Subtotal   : Rs.${subtotal.toLocaleString('en-IN')}
Shipping   : ${shipping === 0 ? 'FREE' : `Rs.${shipping}`}
GST (18%)  : Rs.${gst}

*TOTAL AMOUNT : Rs.${total.toLocaleString('en-IN')}*

-----------------------------
Please share your *delivery address* to confirm this order.

${STORE_WEBSITE}
-----------------------------`;

  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');
};