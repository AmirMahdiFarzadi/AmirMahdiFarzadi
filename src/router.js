const app = document.getElementById("app");

let currentPage = null;

export async function loadPage(page){

    if(currentPage?.cleanup){
        currentPage.cleanup();
    }

    const response = await fetch(`pages/${page}/index.html`);
    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    // console.log(doc.body.innerHTML);

    app.innerHTML = html;

    const module = await import(`../pages/${page}/index.js`);

    currentPage = module;

    if (module.init) {
        module.init();
    }

}