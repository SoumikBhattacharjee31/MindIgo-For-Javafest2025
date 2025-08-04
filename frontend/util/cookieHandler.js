import Cookie from 'js-cookie';

function set_cookie(name, value) {
  document.cookie = `${name}=${value}; Path=/;`;
}
  
function delete_cookie(name) {
  document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
}
  
function removeCookie(name){
  Cookie.remove(name);
}
export { set_cookie, delete_cookie, removeCookie };
  