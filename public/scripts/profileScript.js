document.querySelector("#info_edit_button").addEventListener("click",()=>{
    document.querySelector(".personal_info_edit").classList.add("display_infor");
    document.querySelector(".personal_info").classList.add("hide_infor");
    
})

document.querySelector("#info_back_button").addEventListener("click",()=>{
    document.querySelector(".personal_info").classList.remove("hide_infor");
    document.querySelector(".personal_info_edit").classList.remove("display_infor");
    
})

document.querySelector("#novel_add_button").addEventListener("click",()=>{
    document.querySelector(".mynovels_edit").classList.add("display_infor");
    document.querySelector(".mynovels_info").classList.add("hide_infor");
    
})

document.querySelector("#novel_back_button").addEventListener("click",()=>{
    document.querySelector(".mynovels_info").classList.remove("hide_infor");
    document.querySelector(".mynovels_edit").classList.remove("display_infor");
    
})