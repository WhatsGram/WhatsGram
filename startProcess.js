const { replicate, clean, fetchSession } = require("./session/manage");

async function main() {
  try {
    clean();
    await fetchSession();
    await replicate();
    setTimeout(() => {
      require("./index");
    }, 2000);
  } catch (error) {
    console.error(error?.message);
  }
}
main();
