console.log("validation running");
const username = document.querySelector("#username");
const password = document.querySelector("#password");
const confirmPassword = document.querySelector("#confirmPassword");
const createBTN = document.querySelector(".createBTN");
const e1 = document.querySelector(".e1");
const e2 = document.querySelector(".e2");
const e3 = document.querySelector(".e3");

let v1 = false;
let v2 = false;
let v3 = false;

createBTN.disabled = true;

function changeStateButton(){
    if(v1 && v2 && v3){
        createBTN.disabled = false;
    }
}

username.addEventListener("input",()=>{
    if(username.value == ""){
        username.setCustomValidity("Invalid field.");
        e1.textContent = "This field cannot be empty.";
        v1 = false;
        createBTN.disabled = true;
    }else if(username.value.includes(" ")){
        e1.textContent = "Spaces are not allowed."
        username.setCustomValidity("Invalid field.");
        v1 = false;
        createBTN.disabled = true;
    }else if(username.value.length>15){
        e1.textContent = "Username must be 15 characters or fewer."
        username.setCustomValidity("Invalid field.");
        v1 = false;
        createBTN.disabled = true;
    }else{
        v1 = true
        e1.textContent = ""
        username.setCustomValidity("");
        changeStateButton();
    }
});

password.addEventListener("input",()=>{
    if(confirmPassword.value != password.value){
        e3.textContent = "Passwords do not match"
        confirmPassword.setCustomValidity("Invalid field.");
    }else{
        e3.textContent = ""
        confirmPassword.setCustomValidity("");
    }
    if(password.value.length<8){
        e2.textContent = "Password must have at least 8 characters."
        password.setCustomValidity("Invalid field.");
        v2 = false;
        createBTN.disabled = true;
    }else if(!password.value.match(/\d+/)){
        e2.textContent = "Password must have a number."
        password.setCustomValidity("Invalid field.");
        v2 = false;
        createBTN.disabled = true;
    }else {
        e2.textContent = ""
        password.setCustomValidity("");
        v2 = true;
        changeStateButton();
    }
});

confirmPassword.addEventListener("input",()=>{
    if(confirmPassword.value != password.value){
        e3.textContent = "Passwords do not match"
        confirmPassword.setCustomValidity("Invalid field.");
        v3 = false;
        createBTN.disabled = true;
    }else {
        e3.textContent = ""
        confirmPassword.setCustomValidity("");
        v3 = true;
        changeStateButton();
    }
});