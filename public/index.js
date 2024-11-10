const openDialogBtn = document.querySelector("#openDialogBtn");
const myDialog = document.querySelector("#myDialog");
const closeDialogBtn = document.querySelector("#closeDialogBtn");

const uploadButton = document.querySelector('#uploadButton');
const fileInput = document.querySelector('#fileInput');
const uploadForm = document.querySelector('#uploadForm');
const folderForm = document.getElementById("folderForm")
const folderDialog = document.querySelector('#folderDialog');

const folderDialogBTN  = document.querySelector('#openFolderDialog');
const lastPathSegment = window.location.pathname.split('/').filter(Boolean).pop();

const folderMenu = document.querySelector("#folderMenu");
const fileMenu = document.querySelector("#fileMenu");
const renameFolderDialog = document.querySelector("#renameFolderDialog");
const EditFolderBTN = document.querySelector("#EditFolderBTN");
const FnewName = document.querySelector("#FnewName");

let curFolderId = null;
let curFileId = null;

function openFolderOptions(event, id){
  fileMenu.style.display = 'none'
  event.stopPropagation();
  curFolderId = id;
  console.log("curFolderId: " + curFolderId);

  let x = event.clientX;
  let y = event.clientY;

  folderMenu.style.left = x-220 + 'px';
  folderMenu.style.top = y-130 + 'px';

  folderMenu.style.display = (folderMenu.style.display === 'block') ? 'none' : 'block';
}

function openFileOptions(event, id){
  folderMenu.style.display = 'none'
  event.stopPropagation();
  curFileId = id;
  console.log("curFileId: " + curFileId);

  let x = event.clientX;
  let y = event.clientY;

  fileMenu.style.left = x-220 + 'px';
  fileMenu.style.top = y-130 + 'px';

  fileMenu.style.display = (fileMenu.style.display === 'block') ? 'none' : 'block';
}

folderForm.action = `/addFolder/${lastPathSegment}`;
openDialogBtn.addEventListener("click", function() {
    myDialog.showModal();
});

EditFolderBTN.addEventListener("click", function() {
  renameFolderDialog.showModal();
});

folderDialogBTN.addEventListener("click", function() {
    myDialog.close();
    folderDialog.showModal();
});
function closeFolder(){
  folderDialog.close();
}
function closeEditFolder(){
  renameFolderDialog.close();
  folderMenu.style.display ='none';
}


uploadButton.addEventListener('click', () => {
    fileInput.click();
  });

fileInput.addEventListener('change', () => {
    if (fileInput.files.length > 0) {
      uploadForm.action = "/upload/" + lastPathSegment;
      uploadForm.submit();
    }
});


function openFolder(){
  window.location.href = "/Files/" + curFolderId;
};

async function deleteFolder(){
  await fetch("/deleteFolder/" + curFolderId, {
    method: "POST"
  });
  window.location.reload();
};

async function deleteFile(){
  console.log("try delete");
  await fetch("/deleteFile/" + curFileId, {
    method: "POST"
  });
  window.location.reload();
};

async function renameFolder() {
  console.log(FnewName.value);
  const params = new URLSearchParams();
  params.append('name', FnewName.value);
  await fetch("/renameFolder/" + curFolderId, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: params.toString()
  });
  window.location.reload();
}