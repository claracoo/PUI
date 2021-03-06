// const { get } = require("http");

function initNavbar(page) {
  let homeStatus = "";
  let productsStatus = "";
  let contactStatus = "";
  if (page == "Home") homeStatus = "Home"
  else if (page == "Products") productsStatus = "Home"
  else if (page == "Contact") contactStatus = "Home"
  let base = ` <div class="navbarLinks"><a href="./index.html" id='${homeStatus}'>Home</a><a href='./products.html' id='${productsStatus}'>Products</a><a href="./contact.html" id='${contactStatus}'>Contact</a></div>
  <img src="./images/logo.png" alt="logo" class="logo" />
  <div class="cartDiv" onmouseover="showHoverCart()" onmouseout="hideHoverCart()">
  <div>
      <img src="./images/cart.png" alt="cart" class="cart" onclick="navToCart()"/>
      <div class="numItems">0</div>
  </div>
<div id="cartOnHover"></div>
</div>`

  //what if theres already things there --> replace it
  document.getElementById('tab').innerHTML = "";
  document.getElementById('tab').insertAdjacentHTML("beforeend", base)
}

function initHome(page) {
  initNavbar(page);
  getNumItems();
}

function initContact(page) {
  initNavbar(page);
  getNumItems();
}

function initDetails(page) {
  initNavbar(page);
  localStorage.removeItem("glaze");
  let name = localStorage.getItem("name");
  let img = sweets[name]["images"][0];
  let img1 = sweets[name]["images"][1];
  let img2 = sweets[name]["images"][2];
  let ingredients = sweets[name]["ingredients"];
  let price = sweets[name]["price"];
  let rating = sweets[name]["rating"];
  document.getElementById("pastryTitle").innerHTML = name + " Cinnabon";
  document.getElementById("mainImg").src = img;
  document.getElementById("miniImg1").src = img;
  document.getElementById("miniImg1").style.border = "3px solid #eab5eb";
  document.getElementById("miniImg2").src = img1;
  document.getElementById("miniImg3").src = img2;
  document.getElementById("ingredients").innerHTML = ingredients;
  document.getElementById("price").innerHTML = price;

  // library use commented out, but saving for later
  // let stars = document.getElementsByClassName("fa fa-star");

  // for (var i of Array(rating).keys()) {
  //     stars[i].classList.add("checked")
  // }

  getNumItems();

  let addButton = document.getElementsByClassName("addToCart")[0]
  addButton.style.backgroundColor = "#6A6A6A";
  addButton.style.color = "#B6B6B6";
  addButton.style.cursor = "not-allowed";
  addButton.style.border = "4px solid #6A6A6A";

}

function initProducts(page) {
  initNavbar(page);
  let base = `<div class="productContainer">`
  for (var sweet of Object.values(sweets)) {
          let perItemBase = `<div class="item">`; 
          perItemBase += `<div class="card">`; 
            perItemBase += `<img src=${sweet.images[0]} class="cinnImg" alt="original cinnabon" onClick="goToDetails('${sweet.name}')"></img>`; 
            perItemBase += `<div class="cinnInfo" onClick="goToDetails('${sweet.name}')">`; 
              perItemBase += `<p class="cinnType">${sweet.name}</p>`; 
              perItemBase += `<p class="cinnPrice">${sweet.price}</p>`; 
            perItemBase += `</div>`; 
            perItemBase += `<div class="quickaddMenu">`; 
              perItemBase += `<button class="quickadd" onClick="goToDetails('${sweet.name}')">See More</button>`; 
            perItemBase += `</div>`; 
          perItemBase += `</div>`; 
        perItemBase += `</div>`; 
        base += perItemBase;
   }
   base += `</div>`

   document.getElementById('onload').insertAdjacentHTML("beforeend", base)
   getNumItems();
}

function initCart(page) {
  initNavbar(page);
  getNumItems();
  document.getElementsByClassName("cartDiv")[0].style.borderBottom = "4px solid #B5E8EB;"
  let baseCartBody = `<div class="cartElems">`;
  let baseCheckoutBody = ``;
  let totalPrice = 0;
  let count = 0;
  let cart = JSON.parse(localStorage.getItem("cart"));
  for (let cinn of cart) {
    baseCartBody += `<div class="cartItem" id="cartItem${count}">
                        <div style="height: 10px"></div>
                        <label for="cartItem${count}">
                            <div>
                                <div class="cartItemLeft">
                                    <p class="cartCinn"><span class="cartCinnName">${cinn.name}</span> Cinnabon</p>
                                    <p class="cartCinnGlaze"><span class="cartItemGlaze">${cinn.glaze}</span> Glaze</p>
                                </div>
                                <div class="cartItemRight">
                                    <p class="cartItemPrice">${cinn.price}</p>
                                    <div class="cartItemQuantChanger">
                                        <button onClick="subtractNumFromCart('${cinn.name}', '${cinn.glaze}', '${count}')">-</button>
                                        <p class="perItemQuant" id="perItemQuant${count}">${cinn.quantity}</p>
                                        <button onClick="addNumToCart('${cinn.name}', '${cinn.glaze}', '${count}')">+</button>
                                    </div>        
                                </div>
                            </div>
                        </label><br class="breakLine">
                      </div>`
    baseCheckoutBody += `<p class="checkoutLeft" id="checkoutItem${count}">${cinn.quantity}x ${cinn.name} Cinnabon with ${cinn.glaze} Glaze</p>
                          <p class="checkoutRight" id="checkoutPrice${count}">${cinn.quantity * Number(cinn.price.replace("$", ""))}.00</p>`
    totalPrice += cinn.quantity * Number(cinn.price.replace("$", ""));
  }
  
  if (cart.length == 0){
    baseCartBody += `<p style="margin-left: 10px">Looks like there is nothing in your cart :(</p></div>`
    baseCheckoutBody += `<p style="margin-left: 10px">Looks like there is nothing to checkout :(</p></div>`
    document.getElementById("taxPrice").innerHTML = 0.00
  }
  else {
    totalPrice += 0.82
    baseCartBody += `</div><button class="emptyCart" onclick="emptyCart()">Empty Cart</button>`
  }
  document.getElementsByClassName('cartBody')[0].innerHTML = ""
  document.getElementsByClassName('cartBody')[0].insertAdjacentHTML("beforeend", baseCartBody)
  document.getElementsByClassName('checkoutContents')[0].innerHTML = ""
  document.getElementsByClassName('checkoutContents')[0].insertAdjacentHTML("beforeend", baseCheckoutBody)
  document.getElementById("totalPrice").innerHTML = totalPrice
  document.getElementsByClassName("checkout")[0].innerHTML = `Checkout ($${totalPrice})`
}

function subtractNumFromCart(name, glaze, idx) {
  let newQuant = 0;
  let cart = JSON.parse(localStorage.getItem("cart"));
  for (let cinn of cart) {
    if (name == cinn.name && glaze == cinn.glaze) {
      if (Number(cinn.quantity) > 0) {
        cinn.quantity = Number(cinn.quantity) - 1;
        newQuant = Number(cinn.quantity);
      }
    }
  }
  document.getElementById(`perItemQuant${idx}`).innerHTML = newQuant;

  for (let i in cart) if (Number(cart[i].quantity) == 0) cart.splice(i, 1)
  localStorage.setItem('cart', JSON.stringify(cart));
  initCart();
}

function addNumToCart(name, glaze, idx) {
  let newQuant = 0;
  let cart = JSON.parse(localStorage.getItem("cart"));
  for (let cinn of cart) {
    if (name == cinn.name && glaze == cinn.glaze) {
        cinn.quantity = Number(cinn.quantity) + 1;
        newQuant = Number(cinn.quantity);
    }
  }
  document.getElementById(`perItemQuant${idx}`).innerHTML = newQuant;
  localStorage.setItem('cart', JSON.stringify(cart));
  initCart();
}

function emptyCart() {
  localStorage.setItem("cart", JSON.stringify([]));
  initCart();
}

function checkout() {
  emptyCart();
  window.location = "./index.html";
}

function getNumItems() {
  if (localStorage.getItem("cart")) {
    let cart = JSON.parse(localStorage.getItem("cart"));
    let base = ``;
    let count = 0
    let allCinns = 0;
    let totalPrice = 0;
    for (let cinn of cart) {
      allCinns += cinn.quantity;
      let priceAsNum = Number(cinn.price.replace("$", ""));
      let priceForThis = priceAsNum * cinn.quantity;
      totalPrice += priceForThis;
      base += `<div id="${count}" class="cartElem">
                <div class="leftCartHover">
                    <p class="elemInfo"><span class="quantity">${cinn.quantity}</span>x <span class="name">${cinn.name}</span> Cinnabon</p>
                    <p class="glaze">${cinn.glaze} Glaze</p>
                </div>
                <div class="rightCartHover">
                    <p class="price">$${priceForThis}.00</p>
                </div>
              </div>`
        count += 1
    }
    if (allCinns == 0) {
      base += `<p>Looks like there's nothing in your cart :(</p>`
    }
    base += `<button class="viewCart" onclick="navToCart()">View Cart ($${totalPrice}.00)</button>`
    document.getElementById("cartOnHover").innerHTML = base;
    document.getElementsByClassName("numItems")[0].innerHTML = allCinns.toString()

  }
  else {
    localStorage.setItem("cart", JSON.stringify([]));
  }
}

function goToDetails(name) {
    localStorage.setItem("name", name)
    window.location = "./details.html"
}

function changeImg(id) {
  
  document.getElementById("mainImg").src = document.getElementById(`${id}`).src;
  document.getElementById(`miniImg1`).style.border = "3px solid black"
  document.getElementById(`miniImg2`).style.border = "3px solid black"
  document.getElementById(`miniImg3`).style.border = "3px solid black"
  document.getElementById(`${id}`).style.border = "3px solid #eab5eb"
}

function pickGlaze(id) {
  for (var elem of document.getElementsByClassName("check")) {
    if (elem.getElementsByTagName("input")[0].checked) {
      localStorage.setItem("glaze", id)
    }
  }
  addtoCartUnhover();
}

function addToCartHover() {
  if (localStorage.getItem("glaze") != null) {
    let addButton = document.getElementsByClassName("addToCart")[0]
    addButton.style.backgroundColor = "white";
    addButton.style.color = "black";
    addButton.style.cursor = "pointer";
    addButton.style.border = "4px solid black";
  }
}

function addtoCartUnhover() {
  if (localStorage.getItem("glaze") != null) {
    let addButton = document.getElementsByClassName("addToCart")[0]
    addButton.style.backgroundColor = "black";
    addButton.style.color = "white";
    addButton.style.cursor = "pointer";
    addButton.style.border = "none";
  }
}

function navToCart() {
  window.location = "./cart.html"
}

function addToCart(name, glaze){
    checkedName = name;
    checkedGlaze = glaze;
    if (name == '' && glaze == '') {
      checkedName = localStorage.getItem("name")
      checkedGlaze = localStorage.getItem("glaze")
    }
    let alreadyInCart = false;
    let cart = JSON.parse(localStorage.getItem("cart"));
    if (cart.length > 0) {
      for (let cinn of cart) {
        if (cinn.name == checkedName && cinn.glaze == checkedGlaze) {
          cinn.quantity += 1;
          alreadyInCart = true
        }
      }
    }
    if (!alreadyInCart) {
      let newCinn = {
        "name": checkedName,
        "glaze": checkedGlaze,
        "price": sweets[checkedName].price,
        "quantity": 1
      }
      cart.push(newCinn)
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    initDetails("Products");
    document.querySelector('input[type=radio][name=language]:checked').checked = false; 
    return false
}

function logSubmit(event) {
  addToCart("", "")
  event.preventDefault();
}

if (document.getElementById('glazeChoice') != null) {
const form = document.getElementById('glazeChoice');
form.addEventListener('submit', logSubmit);
}


function showHoverCart() {
  document.getElementById("cartOnHover").style.display = "block"
}

function hideHoverCart() {
  document.getElementById("cartOnHover").style.display = "none"
}