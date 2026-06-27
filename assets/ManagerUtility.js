import axios from 'axios';


// Function to create CSRF Token

export function getCookie(name) {
  var cookieValue = null;
  if (document.cookie && document.cookie !== '') {
      var cookies = document.cookie.split(';');
      for (var i = 0; i < cookies.length; i++) {
          var cookie = cookies[i].toString().replace(/^([\s]*)|([\s]*)$/g, ""); 
          if (cookie.substring(0, name.length + 1) === (name + '=')) {
              cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
              break;
          }
      }
  }
  return cookieValue;
}

var csrftoken = getCookie('csrftoken');


// Function to open link of article and count click

export const countClick = async (record) => {
		window.open(record.source_url, "_blank");
		try {
			const response = await axios.post(`/api/UserClick/`,
				{ 
					newsarticle: Number(record.id) 
				},
				{ 
					withCredentials: true,
					headers: { 'X-CSRFToken': csrftoken } 
				}
			);
		} catch (error) {
			console.error("Failed to post click");
		}
	};


