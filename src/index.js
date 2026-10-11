//if("serviceWorker" in navigator){
//    navigator.serviceWorker.register('sw.js').then(registration =>{
//        console.log("SW Registered");
//        console.log(registration);
//    }).catch(error=>{
//        console.log("SW Registration failed");
//        console.log(error);
//    });
//}

import { loadPage } from "./router.js";
import * as runtime from "./runtime.js";
import * as climate from "./climate.js";
import { startScheduler } from "./schedulerEngine.js";
import * as settingsService from "./settingsService.js";
const links = document.querySelectorAll(".nav__link");

climate.loadClimate();
climate.startSampling();
settingsService.initSettings();
startScheduler();

loadPage("home");

links.forEach(link=>{
    link.onclick=()=>{
        const page =
            link.dataset.page;
        if(
            document
                .querySelector(".nav__link--active")
                ?.dataset.page === page
        ){
            return;
        }
        document
            .querySelector(".nav__link--active")
            ?.classList.remove(
                "nav__link--active"
            );
        link.classList.add(
            "nav__link--active"
        );
        loadPage(page);
    };
});