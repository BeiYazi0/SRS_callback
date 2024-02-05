const iframeActionID = 'iframe-action'
const iframeInfoID = 'iframe-info'
const toastContainerID = 'toast-container-1'
const validateContainerID = 'validate-container-1'
const configFormID = ['form-normal-config', 'form-account-config'];
let savedRet = undefined
$(document).ready(function () {
    document.getElementById('card-main').style.pointerEvents = 'none';
    document.getElementById('card-main').style.pointerEvents = 'auto';
}
);
function updateElementHeight() {
    var viewportHeight = window.innerHeight;
    var elementPos = document.getElementById('tab-items').getBoundingClientRect().bottom;
    var result = viewportHeight - elementPos - 73;
    document.getElementById(iframeActionID).style.height = result + 'px';
    document.getElementById(iframeInfoID).style.height = result + 'px';
}
window.onresize = updateElementHeight;
window.onload = updateElementHeight;
var themeDropdownItems = document.querySelectorAll("#themeDropdown + .dropdown-menu a");
var childWindowAction = $(`#${iframeActionID}`)[0].contentWindow;
var childWindowInfo = $(`#${iframeInfoID}`)[0].contentWindow;
themeDropdownItems.forEach(function (item) {
    item.addEventListener("click", function (event) {
        var themeValue = this.getAttribute("data-bs-theme-value");
        childWindowAction.document.body.setAttribute("data-bs-theme", themeValue);
        childWindowInfo.document.body.setAttribute("data-bs-theme", themeValue);
    });
});
function toggle_spinner(status = 'hidden', element) {
    let spanEl = $(element).children("span.spinner-border")
    switch (status) {
        case 'hidden':
            if (!(spanEl.hasClass("visually-hidden"))) {
                spanEl.addClass("visually-hidden")
            }
            break;
        case 'show':
            if (spanEl.hasClass("visually-hidden")) {
                spanEl.removeClass("visually-hidden")
            }
            break
        default:
            spanEl.addClass("visually-hidden")
            break;
    }
};
function show_validate(url) {
	let res = `
	<div class="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
		<div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
			<div class="modal-content">
				<div class="modal-header">
					  <h5 class="modal-title" id="staticBackdropLabel">登录需要验证</h5>
					  <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
				</div>
				<div class="modal-body">
					<iframe src="${url}" frameborder="0" width="100%" style="max-height: 100vh;" height="500"></iframe>

				</div>
				<div class="modal-footer">
					  <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">关闭</button>
				</div>
			</div>
		</div>
	</div>
`

    $(`#${validateContainerID}`).html(res);
	$(document).ready(function() {
		let modal = new bootstrap.Modal(document.getElementById('staticBackdrop'));
		modal.show();

		window.addEventListener('message', function (event) {
			if (event.data === 'closeModal') {
				modal.hide();
			}
		});
	});
}
function show_toast(status, text, desc = null) {
    const classDict = {
        'success': [`text-success-emphasis`, `bg-success-subtle`, `border-success-subtle`],
        'info': [`text-info-emphasis`, `bg-info-subtle`, `border-info-subtle`],
        'warning': [`text-warning-emphasis`, `bg-warning-subtle`, `border-warning-subtle`],
        'error': [`text-danger-emphasis`, `bg-danger-subtle`, `border-danger-subtle`],
    }
    let date = new Date();
    if (desc != null) {
        desc = desc.replace(/\n/g, '<br>')
        var res = `<div id="toast" class="toast" role="alert">
        <div class="toast-header">
        <strong class="me-auto">${text}</strong>
        <small>${date.toLocaleTimeString('en-US', { hour12: false })}</small>
        <button class="btn-close ms-2 mb-1 close" type="button" aria-label="Close" data-bs-dismiss="toast"></button></div>
        <div class="toast-body" role="alert">
        <p>${desc}</p>
        </div></div>`
    } else {
        var res = `<div id="toast" class="toast" role="alert">
        <div class="toast-body d-flex align-items-center" role="alert" style="padding: var(--bs-toast-padding-y) var(--bs-toast-padding-x);">
        <strong class="me-auto">${text}</strong>
        <small>${date.toLocaleTimeString('en-US', { hour12: false })}</small>
<!--        <button class="btn-close ms-2 mb-1 close" type="button" aria-label="Close" data-bs-dismiss="toast" style="margin-right: calc(-.5 * var(&#45;&#45;bs-toast-padding-x));"></button>-->
        </div></div>`;
    }
    if (status in classDict) {
        var classNames = classDict[status];
    } else {
        var classNames = classDict['info'];
    }
    let parser = new DOMParser();
    let toastElement = parser.parseFromString(res, 'text/html').getElementById('toast');
    for (let i = 0; i < classNames.length; i++) {
        toastElement.classList.add(classNames[i]);
    }
    document.getElementById(toastContainerID).appendChild(toastElement);
    let toast = new bootstrap.Toast(toastElement);
    toast.show()
    toastElement.addEventListener('hidden.bs.toast', function () {
        toastElement.parentNode.removeChild(toastElement);
    });
}
function delete_config() {
    document.getElementById('main-tab-content').style.pointerEvents = 'none';
    let app = $("#input-app").val();
    let stream = $("#input-stream").val();
    $.ajax({
        url: `/api/info/delete?app=` + app + '&stream=' + stream,
        type: "get",
        processData: false,
        success: function (ret) {
            show_toast('success', "删除配置成功。")
            document.getElementById('main-tab-content').style.pointerEvents = 'auto';
        },
        error: function (ret) {
            show_toast('error', "删除配置失败。", ret.responseText)
            setTimeout(function() {
                location.reload(true);
            }, 3000);
        }
    });
}
function update_info() {
    document.getElementById('main-tab-content').style.pointerEvents = 'none';
    let app = $("#input-app").val();
    let stream = $("#input-stream").val();
    let username = $("#input-username").val();
    let key = $("#input-key").val();
    $.ajax({
        url: `/api/info/update?app=` + app + '&stream=' + stream + '&username=' + username + '&key=' + key,
        type: "get",
        processData: false,
        success: function (ret) {
            show_toast('success', '本次修改保存成功。')
            document.getElementById('main-tab-content').style.pointerEvents = 'auto';
        },
        error: function (ret) {
            show_toast('error', '本次修改保存失败。', `将于三秒后刷新页面，如有需要请联系管理员。\n${ret.responseText}`);
            setTimeout(function() {
                location.reload(true);
            }, 3000);
        },
    });
}
function reset_config_form() {
    configFormID.forEach(function (item) {
        document.getElementById(item).reset();
    });
}
