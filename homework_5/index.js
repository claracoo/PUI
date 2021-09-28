function initHome() {
  getNumItems();
}

function initContact() {
  getNumItems();
}


function getNumItems() {
  if (localStorage.getItem("itemsInCart") == null) {
    localStorage.setItem("itemsInCart", 0);
    document.getElementsByClassName("numItems")[0].innerHTML = 0;
  }
  else {
    document.getElementsByClassName("numItems")[0].innerHTML = localStorage.getItem("itemsInCart");
  }
}




function initProducts() {
    let base = `<div class="productContainer">`
    for (var sweet of Object.values(sweets)) {
            let perItemBase = `<div class="item" onClick="goToDetails('${sweet.name}')">`; 
            perItemBase += `<div class="card">`; 
              perItemBase += `<img src=${sweet.images[0]} class="cinnImg" alt="original cinnabon"></img>`; 
              perItemBase += `<div class="cinnInfo">`; 
                perItemBase += `<p class="cinnType">${sweet.name}</p>`; 
                perItemBase += `<p class="cinnPrice">${sweet.price}</p>`; 
              perItemBase += `</div>`; 
              perItemBase += `<div class="quickaddMenu">`; 
                perItemBase += `<button class="quickadd">Quick Add</button>`; 
              perItemBase += `</div>`; 
            perItemBase += `</div>`; 
          perItemBase += `</div>`; 
          base += perItemBase;
     }
     base += `</div>`

     document.getElementById('onload').insertAdjacentHTML("beforeend", base)
     getNumItems();
}

function goToDetails(name) {
    localStorage.setItem("name", name)
    window.location = "./details.html"
}

function initDetails() {
    localStorage.removeItem("glaze");
    console.log("init")
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

    let stars = document.getElementsByClassName("fa fa-star");

    for (var i of Array(rating).keys()) {
        stars[i].classList.add("checked")
    }

    getNumItems();

    let addButton = document.getElementsByClassName("addToCart")[0]
    addButton.style.backgroundColor = "#6A6A6A";
    addButton.style.color = "#B6B6B6";
    addButton.style.cursor = "not-allowed";
    addButton.style.border = "4px solid #6A6A6A";

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