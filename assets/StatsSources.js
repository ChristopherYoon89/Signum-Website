import React, {useState, useEffect} from 'react';
import { 
	Rate,
 } from 'antd';


function getCookie(name) {
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


const PopOverContent = ({record}) => {
	const average_user_value = record.average_sourcerating ? Math.min(Math.ceil(record.average_sourcerating), 5) : 0;

	return (
		<>
			<div style={{ marginTop: 15, }}>
				<p>
					<span className="antd-home-rating">Average user rating:</span> 
					<Rate style={{fontSize: "small", }} disabled value={average_user_value}/>
				</p>
		</div>
	</>
	)
}
export default PopOverContent; 