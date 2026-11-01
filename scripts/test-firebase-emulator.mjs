async function test() {
  const res = await fetch('http://127.0.0.1:5000/');
  console.log('Status /:', res.status);
  console.log('Headers /:', Object.fromEntries(res.headers.entries()));

  const resIndex = await fetch('http://127.0.0.1:5000/index.html');
  console.log('Status /index.html:', resIndex.status);
  console.log('Headers /index.html:', Object.fromEntries(resIndex.headers.entries()));

  const resCss = await fetch('http://127.0.0.1:5000/_next/static/css/8f2f4239cf7b2139.css');
  console.log('Status css:', resCss.status);
  console.log('Headers css:', Object.fromEntries(resCss.headers.entries()));
}
test().catch(console.error);
