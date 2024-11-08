const openDialogBtn = document.querySelector("#openDialogBtn");
const myDialog = document.querySelector("#myDialog");
const closeDialogBtn = document.querySelector("#closeDialogBtn");

const uploadButton = document.querySelector('#uploadButton');
const fileInput = document.querySelector('#fileInput');
const uploadForm = document.querySelector('#uploadForm');

const folderDialog = document.querySelector('#folderDialog');

const folderDialogBTN  = document.querySelector('#openFolderDialog');

openDialogBtn.addEventListener("click", function() {
    myDialog.showModal();
});
folderDialogBTN.addEventListener("click", function() {
    myDialog.close();
    folderDialog.showModal();
});

uploadButton.addEventListener('click', () => {
    fileInput.click();
  });

fileInput.addEventListener('change', () => {
    if (fileInput.files.length > 0) {
      uploadForm.submit();
    }
});