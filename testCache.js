import fetch from "node-fetch";

async function test() {
    const url = "http://localhost:8080/api/problems?page=1&limit=10";

    console.time("First request");
    let res1 = await fetch(url);
    console.log(await res1.json());
    console.timeEnd("First request");

    console.time("Second request");
    let res2 = await fetch(url);
    console.log(await res2.json());
    console.timeEnd("Second request");
}

test();
