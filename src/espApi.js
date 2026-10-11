const ESP_IP = "192.168.1.5";


export async function getStatus(){

    const response = await fetch(
        `http://${ESP_IP}/api/status`
    );

    const data = await response.json();

    return data;

}