import React, { useState, useEffect } from 'react';
import { getProducts, orderID, processPayment, createOrder } from './apiCore';
import { emptyCart } from './cartHelpers';
import Card from './Card';
import { isAuthenticated } from '../auth';
import { Link } from 'react-router-dom';
// import "braintree-web"; // not using this package
//import DropIn from 'braintree-web-drop-in-react';

function loadScript(src) {
	return new Promise((resolve) => {
		const script = document.createElement('script')
		script.src = src
		script.onload = () => {
			resolve(true)
		}
		script.onerror = () => {
			resolve(false)
		}
		document.body.appendChild(script)
	})
};


const Checkout = ({ products }) => {

    const [data, setData] = useState({
        loading: false,
        success: false,
        clientToken: null,
        error: '',
        instance: {},
        address: ''
    });

    const showCheckout = () => {
        return isAuthenticated() ? (
            <div>{showDropIn()}</div>
            ) : (
            <Link to="/signin">
                <button className="btn btn-primary">Sign in to checkout</button>
            </Link>
        );
    };

    const getTotal = () => {
        return products.reduce((currentValue, nextValue) => {
                return currentValue + nextValue.count * nextValue.price;
        }, 0);
    };
    const handleAddress = event => {
         setData({ ...data, address: event.target.value });
    };

    async function buy () {
        const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
        if (!res) {
			alert('Razorpay SDK failed to load. Are you online?')
			return
        }
        const orderData = await fetch(`http://localhost:1337/razorpay`, { method: 'POST' }).then((t) =>
			t.json()
        )
        const options = {
			key: 'rzp_test_CGkoKVVtJUfsSC',
			currency: orderData.currency,
			amount: 100,
			order_id: orderData.id,
			name: 'payment',
			description: 'Thank you for purchase from us',
			handler: function (response) {
				alert(response.razorpay_payment_id)
				alert(response.razorpay_order_id)
				alert(response.razorpay_signature)
			},
			prefill: {
				name : 'saheb',
				email: 'saheb@test.com',
				phone_number: '9899999999'
			}
		}
		const paymentObject = new window.Razorpay(options)
		paymentObject.open()
    };

    const showDropIn = () => (
        <div onBlur={() => setData({ ...data, error: '' })}>
            <div className="gorm-group mb-3">
                <label className="text-muted">Delivery address:</label>
                <textarea
                    onChange={handleAddress}
                    className="form-control"
                    value={data.address}
                    placeholder="Type your delivery address here..."
                />
            </div>
            <button onClick={buy} className="btn btn-success btn-block">
                Checkout
            </button>
        </div>
    );

    let deliveryAddress = data.address;

    const showSuccess = success => (
        <div className="alert alert-info" style={{ display: success ? '' : 'none' }}>
            Thanks! Your payment was successful!
        </div>
    );

    const showError = error => (
        <div className="alert alert-danger" style={{ display: error ? '' : 'none' }}>
            {error}
        </div>
    );

    const showLoading = loading => loading && <h2 className="text-danger">Loading...</h2>;
    
    return (
        <div>
            <h2>Total: {getTotal()}</h2>
            {showLoading(data.loading)}
            {showSuccess(data.success)}
            {showError(data.error)}
            {showCheckout()}
        </div>
    )
};

export default Checkout;



//     const userId = isAuthenticated() && isAuthenticated().user._id;
//     const token = isAuthenticated() && isAuthenticated().token;

//     const getToken = (userId, token) => {
//         orderID(userId, token).then(data => {
//             if (data.error) {
//                 console.log(data.error);
//                 setData({ ...data, error: data.error });
//             } else {
//                 console.log(data);
//                 setData({ clientToken: data.clientToken });
//             }
//         });
//     };

//     useEffect(() => {
//         getToken(userId, token);
//     }, []);

//     let deliveryAddress = data.address;

//     const buy = () => {
//         setData({ loading: true });
//         // send the nonce to your server
//         // nonce = data.instance.requestPaymentMethod()
//         let nonce;
//         let getNonce = data.instance
//             .requestPaymentMethod()
//             .then(data => {
//                 // console.log(data);
//                 nonce = data.nonce;
//                 // once you have nonce (card type, card number) send nonce as 'paymentMethodNonce'
//                 // and also total to be charged
//                 // console.log(
//                 //     "send nonce and total to process: ",
//                 //     nonce,
//                 //     getTotal(products)
//                 // );
//                 const paymentData = {
//                     paymentMethodNonce: nonce,
//                     amount: getTotal(products)
//                 };

//                 processPayment(userId, token, paymentData)
//                     .then(response => {
//                         console.log(response);
//                         // empty cart
//                         // create order

//                         const createOrderData = {
//                             products: products,
//                             transaction_id: response.transaction.id,
//                             amount: response.transaction.amount,
//                             address: deliveryAddress
//                         };

//                         createOrder(userId, token, createOrderData)
//                             .then(response => {
//                                 emptyCart(() => {
//                                     setRun(!run); // run useEffect in parent Cart
//                                     console.log('payment success and empty cart');
//                                     setData({
//                                         loading: false,
//                                         success: true
//                                     });
//                                 });
//                             })
//                             .catch(error => {
//                                 console.log(error);
//                                 setData({ loading: false });
//                             });
//                     })
//                     .catch(error => {
//                         console.log(error);
//                         setData({ loading: false });
//                     });
//             })
//             .catch(error => {
//                 // console.log("dropin error: ", error);
//                 setData({ ...data, error: error.message });
//             });
//     };

//     const showDropIn = () => (
//         <div onBlur={() => setData({ ...data, error: '' })}>
//             {data.clientToken !== null && products.length > 0 ? (
//                 <div>
//                     <div className="gorm-group mb-3">
//                         <label className="text-muted">Delivery address:</label>
//                         <textarea
//                             onChange={handleAddress}
//                             className="form-control"
//                             value={data.address}
//                             placeholder="Type your delivery address here..."
//                         />
//                     </div>
//                     <button onClick={buy} className="btn btn-success btn-block">
//                         Pay Now
//                     </button>
//                 </div>
//             ) : null}
//         </div>
//     );

