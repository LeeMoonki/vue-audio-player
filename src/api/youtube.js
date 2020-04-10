import { API_KEY } from '@/config';

export const getInfoUsingId = id => {
  return fetch(`https://www.googleapis.com/youtube/v3/videos?part=id,snippet&id=${id}&key=${API_KEY}`).then(res => {
    return res.json().then(d => {
      let title = '';
      let error = null;

      try {
        title = d.items[0].snippet.title;
      } catch (e) {
        title = '';
        error = e;
      }

      return {
        success: true,
        data: d,
        title: title,
        error
      };
    });
  }).catch(err => {
    return {
      success: false,
      error: err
    };
  })
};