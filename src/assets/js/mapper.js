export const MEDIA_KIND = {
  youtube: 'YOUTUBE',
};

export const workCondition = condition => {
  if (typeof condition === 'string') {
    switch (condition) {
      case 'will': return 0;
      case 'working': return 1;
      case 'done': return 2;
      default: return 0;
    }
  }
  if (typeof condition === 'number') {
    if (condition !== 0 || condition !== 1 || condition !== 2) {
      return 0;
    } else {
      return condition;
    }
  }
  return condition ? 2 : 0;
};

export const workMapper = ({ condition, will, working, done, defaultVal }) => {
  return condition === 0 ? (will || (defaultVal != null ? defaultVal : '미작업')) :
    condition === 1 ? (working || (defaultVal != null ? defaultVal : '작업중')) :
    condition === 2 ? (done || (defaultVal != null ? defaultVal : '작업완료')) :
    (defaultVal != null ? defaultVal : '미작업');
};

export const mediaDataMapper = (d, kind = MEDIA_KIND.youtube, work = {}) => {
  return {
    id: d.id,
    imageUrl: d.imageUrl,
    videoUrl: d.videoUrl,
    title: d.title,
    data: kind === MEDIA_KIND.youtube ? d.snippet : {},
    work: {
      worker: work.worker || '-', // 작업자
      split:  workCondition(work.split), // 화자분리 여부
      audioCheck: workCondition(work.audioCheck), // 음성조정 여부
      textSubmit: workCondition(work.textSubmit), // 자막등록 여부
    },
  };
};

