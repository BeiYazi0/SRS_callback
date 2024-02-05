function check_input(e) {
    e.value=e.value.replace(/[\\\|?*/]/g, '')
    let btnLogin = document.getElementById("btn-login");
    let btnReg = document.getElementById("btn-register");
    if (e.value === "") {
        btnLogin.setAttribute("disabled", "disabled");
        btnReg.setAttribute("disabled", "disabled");
    } else {
        btnLogin.removeAttribute("disabled");
        btnReg.removeAttribute("disabled");
    }
}
function login() {
    document.getElementById('card-index').style.pointerEvents = 'none';
    let account = $("#account").val()
    let password = $("#password").val()
    $.ajax({
        url: "/api/login?account=" + account + "&password=" + password,
        type: "get",
        processData: false,
        success: function (ret) {
            window.location.href = "/config.html?account=" + account + "&password=" + password;
        },
        error: function (ret) {
            alert("账号无效或不存在\n" + ret.responseText);
            document.getElementById('card-index').style.pointerEvents = 'auto';
        }
    });
}
document.addEventListener('keydown', function(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        login();
    }
});
