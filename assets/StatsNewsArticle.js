import React, {useState, useEffect} from 'react';
import { 
	Tag,
	Rate,
 } from 'antd';
import Axios from "axios";
import axios from 'axios';
import { useAuth } from './AuthProvider.js';


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


const ArticleStatsPopOverContent = ({record}) => {
	const [user_rating_value, setUserRatingValue] = useState(0);
	const source_average_algo_rating_value = record.average_algo_sourcerating ? Math.min(Math.ceil(record.average_algo_sourcerating), 5): 0;
	const source_average_user_rating_value = record.average_sourcerating ? Math.min(Math.ceil(record.average_sourcerating), 5) : 0;
	const average_user_value = record.average_rating ? Math.min(Math.ceil(record.average_rating), 5) : 0;
	const algo_rating_value = record.algo_rating ? Math.min(Math.ceil(record.algo_rating), 5) : 0;
	const { isauthenticated, user } = useAuth();



	useEffect(() => {
		if (!isauthenticated) {
			setUserRatingValue(0);
			return;
		};

		const fetchUserRating = async () => {
			try {
				const response = await axios.get("/api/UserRating/", {
					params: 
					{ 
						newsarticle: record.id,
					}, 
				});

				if (response.status === 200 && response.data.length > 0) {
					const value = response.data[0]?.userrating;
					setUserRatingValue(value || 0);
				}
			} catch (error) {
				console.error("Failed to fetch user rating");
			}
		};
		fetchUserRating();
	}, [record]);


	const onChangeUserRating = async (article_id, value) => {
		if (!isauthenticated) return; 
		if (!value || value < 1 || value > 5) return;

		try {
			const response = await Axios.post(
				`/api/UserRating/`,
				{ 
					newsarticle: parseInt(article_id),
					userrating: parseInt(value), 
				},
				{ headers: { 'X-CSRFToken': csrftoken } }
			);

			setUserRatingValue(value);
		} catch (error) {
			console.error("Failed to post personal rate");
		}
	};


	return (
		<>
			<div>
				<p>
					<span className="article-stats-text">Your rating:</span> 
					<Rate 
						style={{ fontSize: "small", }}
						disabled={
							isauthenticated
										?	false
										: true
						}
						onChange={(value) => onChangeUserRating(record.id, value)}
						value={user_rating_value}
						/> 
				</p>
				<p>
					<span className="article-stats-text">Average user rating:</span> 
					<Rate style={{fontSize: "small", }} disabled value={average_user_value}/>
				</p>
				<p>
					<span className="article-stats-text">Algorithm rating:</span>
					<Rate style={{fontSize: "small", }} disabled value={algo_rating_value}/>
				</p>
				<p>
					<span className="article-stats-text">Article clicks:</span> 
					<Tag color={'geekblue'}>{record.clicks_count}</Tag>
				</p>
				<p>
					<span className="article-stats-text">Source user rating:</span> 
					<Rate style={{fontSize: "small", }} disabled value={source_average_user_rating_value}/>
				</p>
				<p>
					<span className="article-stats-text">Source algo rating:</span>
					<Rate style={{fontSize: "small", }} disabled value={source_average_algo_rating_value} />
				</p>
		</div>
	</>
	)
}
export default ArticleStatsPopOverContent; 