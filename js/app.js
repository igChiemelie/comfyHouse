M.AutoInit();

// ======= VIDEO   2.25.35
// $(document).ready(function () {
//     $('.uche').sidenav({
//         edge: 'right',
//     });
// });


const cartBtn = document.querySelector(".cart-btn");
const closecartBtn = document.querySelector(".close-cart");
const clearcartBtn = document.querySelector(".clear-cart");
const checkOut = document.querySelector(".checkOut");
const cartDOM = document.querySelector(".cart");
const cartOverlay = document.querySelector(".cart-overlay");
const cartItems = document.querySelector(".cart-items");
const cartContent = document.querySelector(".cart-content");
const carttotal = document.querySelector(".cart-total");
const productsDOM = document.querySelector(".products-center");

// const btns = document.querySelectorAll(".bag-btn");

//Cart
let cart = [];
// let itemsTotal = [];

//buttons
let buttonsDOM = [];

//Getting the products
class Products{
    async getProducts() {
        try {
            let result = await fetch("products.json");
            let data = await result.json();
            // return data;

            let products = data.items;
            products = products.map(item => {
                const { title, price } = item.fields;
                const { id } = item.sys;
                const img = item.fields.img.fields.file.url;
                return { title, price, id, img }
            })
            return products;
        } catch (error) {
            console.log(error);
        }
    }
}

//display pr oducts
class UI{
    displayProducts(products) {
        let result = "";
        products.forEach(product => {
            // console.log(product);
            result += `
                <article class="product">
                    <div class="img-container">
                        <img src=${product.img} alt="" style="height:200px;" class="product-img">
                        <button class="bag-btn" data-id=${product.id}>
                            <i class="material-icons" style="vertical-align: middle;">shopping_cart</i>
                            add to bag
                        </button>
                    </div>
                    <h3>${product.title}</h3>
                    <h4>$${product.price}</h4>
                </article>
                `;
        });
        
        productsDOM.innerHTML = result;
    }

    getBagButtons() {
        //the three dots turns d document into an Array
        const buttons = [...document.querySelectorAll(".bag-btn")];
        // console.log(buttons);
        
        buttonsDOM = buttons;  
         buttons.forEach(button => {
            let id = button.dataset.id;
            // console.log(id);
            let inCart = cart.find(item => item.id === id);
            // let inCart = cart.find(function (item) {
            //     console.log(item);
            // });
            // console.log(inCart);
            if (inCart) {
                button.innerText = "In Cart";
                button.disabled = true;
            }
            button.addEventListener("click", event => {
                event.target.innerText = "In Cart";
                event.target.disabled = true;
                // console.log(event);

                //get proudct from products
                let cartItem = {...storage.getProducts(id), amount:1};  //used spread operator eg ...
                
                //add products to cart
                cart = [...cart,cartItem];
        
                //save cart in local storage
                storage.saveCart(cart);
                
                //set cart values
                this.setCartValues(cart);

                //displaly cart item
                this.addCartItem(cartItem);

                //show the cart 
                // this.showCart();
                
            });
            
                
        });
    }

    setCartValues(cart) {
        let tempTotal = 0;
        let itemsTotal = 0;
        cart.map(item => {
            tempTotal += item.price * item.amount;
            // console.log(item.price);
            // console.log(item.amount);

            // console.log(tempTotal);
            itemsTotal += item.amount;
            // console.log(itemsTotal);
            // console.log(item.amount);
        });
        carttotal.textContent = parseFloat(tempTotal.toFixed(2));  //Add up d price + nd converts to 2 decimal places
        cartItems.textContent = itemsTotal;     //updates the cart numbers

        // console.log(carttotal, cartItems);
    }

    addCartItem(item) {
        // console.log(item);
        const div = document.createElement('div');
        // div.setAttribute('class', 'cart-item');
        div.classList.add("cart-item");
        div.innerHTML = ` <img src="${item.img}" alt="bedroom">
        <div><h4>${item.title}</h4>
        <h5>$${item.price}</h5>
        <span class="remove-item" data-id=${item.id}>remove</span></div>
        <div class="item-icons">
            <i class="material-icons up" data-id=${item.id}>arrow_drop_up</i>
            <p class="item-amount" data-id=${item.amount}>1</p>
            <i class="material-icons down" data-id=${item.id}>arrow_drop_down</i>
        </div>`;
        cartContent.appendChild(div);
        // console.log(cartContent);
    }

    showCart() {
        cartOverlay.classList.add("transparentBcg");
        cartDOM.classList.add("showCart");
        checkOut.addEventListener("click", () => {
            console.log('i see u');
            payWithPaystack();
            
        });
    }

    setupApp() {
        cart = storage.getCart();
        // itemsTotal = storage.getCart1();
        this.setCartValues(cart);
        this.populateCart(cart);
        cartBtn.addEventListener('click', this.showCart);
        closecartBtn.addEventListener('click', this.hideCart)
    }

    populateCart(cart) {
        cart.forEach(item => this.addCartItem(item));
    }

    hideCart() {
        cartOverlay.classList.remove("transparentBcg");
        cartDOM.classList.remove("showCart");
    }

    cartLogic() {
        //    clear cart button
        clearcartBtn.addEventListener("click", () => {
            this.clearcart();
        });
        // cart functionality
        cartContent.addEventListener("click", event => {
            // console.log(event.target);

            if (event.target.classList.contains("remove-item")) {
                let removeItem = event.target;
                let id = removeItem.dataset.id;   //Gets d id of the particular  item
                // console.log(id);
                cartContent.removeChild(removeItem.parentElement.parentElement);
                this.removeItem(id);
            }else if (event.target.classList.contains("up")) {
                let addAmount = event.target;
                console.log(addAmount);
                let id = addAmount.dataset.id;
                console.log(id);
                let tempItem = cart.find(item => item.id === id);
                console.log(tempItem);
                tempItem.amount = tempItem.amount + 1;
                storage.saveCart(cart);
                this.setCartValues(cart);
                console.log(tempItem.amount);
                addAmount.nextElementSibling.innerText = tempItem.amount;
            }else if (event.target.classList.contains("down")) {
                let lowerAmount = event.target;
                let id = lowerAmount.dataset.id;
                let tempItem = cart.find(item => item.id === id);
                tempItem.amount = tempItem.amount - 1;
                if (tempItem.amount > 0) {
                    storage.saveCart(cart);
                    this.setCartValues(cart);
                    lowerAmount.previousElementSibling.innerText = tempItem.amount;
                } else {
                    cartContent.removeChild(lowerAmount.parentElement.parentElement);
                    this.removeItem(id);
                }
            }
            
        });
    }

    clearcart() {
        let cartitem = cart.map(item => item.id);
        cartitem.forEach(id => this.removeItem(id));
        // console.log(cartContent.children);
        while (cartContent.children.length > 0) {
            cartContent.removeChild(cartContent.children[0]);
        }
        this.hideCart();
    }

    removeItem(id) {
        cart = cart.filter(item => item.id !== id);
        this.setCartValues(cart);
        storage.saveCart(cart);
        let button = this.getSingleButtons(id);
        button.disabled = false;
        button.innerHTML = `<i class="material-icons">shopping_cart</i>add to bag`;  // `` TEMPLETE LITRAL 
    }

    getSingleButtons(id) {
        return buttonsDOM.find(button => button.dataset.id === id);
    }


    payWithPaystack() {
        var handler = PaystackPop.setup({
            key: 'paste your key here',
            email: 'customer@email.com',
            amount: 10000,
            ref: '' + Math.floor((Math.random() * 1000000000) + 1), // generates a pseudo-unique reference. Please replace with a reference you generated. Or remove the line entirely so our API will generate one for you
            metadata: {
                custom_fields: [
                    {
                        display_name: "Mobile Number",
                        variable_name: "mobile_number",
                        value: "+2348012345678"
                    }
                ]
            },
            callback: function (response) {
                console.log(response);
                alert('success. transaction ref is ' + response.reference);
            },
            onClose: function () {
                alert('window closed');
            }
        });
        handler.openIframe();
    }
}

//local Storage
class storage{
    static saveProducts(products) {
        localStorage.setItem("product", JSON.stringify(products));
    }
   

    static getProducts(id) {
        let products = JSON.parse(localStorage.getItem('product'));
        return products.find(product => product.id === id);
    }

    static saveCart(cart){
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    static getCart() {
        return localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : [];  //TINERAY STATEMENT IF/ELSE
    }

    // static getCart1() {
    //     return localStorage.getItem('itemsTotal') ? JSON.parse(localStorage.getItem('cart')) : [];  //TINERAY STATEMENT IF/ELSE
    // }
}

document.addEventListener("DOMContentLoaded", () => {
    const ui = new UI();
    const products = new Products();

    // setup App
    ui.setupApp();

    //get all products
    products.getProducts().then(products => {
        ui.displayProducts(products);
        storage.saveProducts(products);
    }).then(() => {
        ui.getBagButtons();
        ui.cartLogic();
    });
    // location.reload(true);;
});