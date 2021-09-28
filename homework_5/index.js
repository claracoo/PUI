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
}

function goToDetails(name) {
    localStorage.setItem("name", name)
    window.location = "./details.html"
}

function initDetails() {
    console.log(sweets)
    let name = localStorage.getItem("name")
    let img = sweets[name]["images"][0]
    let img1 = sweets[name]["images"][1]
    let img2 = sweets[name]["images"][2]
    let ingredients = sweets[name]["ingredients"]
    let price = sweets[name]["price"]
    let rating = sweets[name]["rating"]
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
}

function changeImg(id) {
  
  document.getElementById("mainImg").src = document.getElementById(`${id}`).src;
  document.getElementById(`miniImg1`).style.border = "3px solid black"
  document.getElementById(`miniImg2`).style.border = "3px solid black"
  document.getElementById(`miniImg3`).style.border = "3px solid black"
  document.getElementById(`${id}`).style.border = "3px solid #eab5eb"
}

function pickGlaze(id) {
  localStorage.setItem("glaze", id);
}
