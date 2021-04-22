let mc = (() => {

  let d = document;
  let rootPath = "media/";
  let currentPathArr = [];
  // DOM vars
  let video, audio, listing, crumb;
  // Constructs 
  let playlistArr = [];
  let currentIndex = 0;
  const _SELECTED = 'selected';

  return {
    init: () => {
      mc.initDom();
      mc.attachListeners();
      currentPathArr.push(rootPath);
      mc.getPath(rootPath);
    },
    attachListeners: () => {
      listing.addEventListener('click', (e) => { mc.selectThis(e) })
      video.addEventListener('ended', (e) => { mc.trackEnded(e); });
      audio.addEventListener('ended', (e) => { mc.trackEnded(e); });
    },
    initDom: () => {
      image = d.querySelector('.imageMain');
      video = d.querySelector('video');
      audio = d.querySelector('audio');
      crumb = d.querySelector('.crumb');
      listing = d.querySelector('.listing');
    },
    getPath: (path) => {
      let xhttp = new XMLHttpRequest();
      // XMLHttpRequest can open urls and files by path.
      xhttp.onreadystatechange = (event) => {
        if (xhttp.status == 200 && xhttp.readyState == 4) {
          mc.parseDirectory(xhttp.responseText);
        }
      };
      xhttp.open("GET", path, true);
      xhttp.send();
    },
    parseDirectory: (blob) => {
      let parser = new DOMParser();
      let xmlDoc = parser.parseFromString(blob, "text/xml");
      let paths = xmlDoc.querySelectorAll('a');
      mc.updateListings(paths);
    },

    updateListings: (paths) => {
      listing.innerHTML = '';
      playlistArr = [];
      if (paths.length > 0) {
        let holder = d.createDocumentFragment();
        for (let i = 0; i < paths.length; i++) {
          // pathString                              
          let pathString = unescape(paths[i].attributes['href'].value);
          let ext = mc.getExtension(pathString);

          // create playlist Element
          let playlistItem = {
            pathString
          }
          playlistArr.push(playlistItem);

          // Don't show ../ for root directory
          if (
            currentPathArr.length === 1 &&
            currentPathArr[0] === rootPath &&
            pathString === "../" ) {
            continue;
          }

          // create DOM element
          let li = d.createElement('li');
          switch (ext) {
            case 'video':
            case 'audio':
            case 'parent':
              li.classList.add(ext);
              break;
          }

          li.innerHTML = pathString.replace(/.mp3|.mkv|.mp4/, '');
          li.setAttribute('data-path', pathString);
          holder.appendChild(li);
        }
        listing.appendChild(holder);

      }
    },

    getExtension: (pathValue) => {
      // parent direcotry
      if (pathValue === "../") {
        return 'parent';
      }

      // direcotry
      if (pathValue[pathValue.length - 1] === "/") {
        return 'directory';
      }

      let pathExtention = pathValue.substr(-4);
      // Image
      if (pathExtention.match(/jpg|jpeg|gif|png/)) {
        return 'image';
      }
      // Audio
      if (pathExtention.includes('mp3')) {
        return 'audio';
      }
      // Video
      if (pathExtention.match(/mkv|mp4|avi/)) {
        return 'video';
      }
    },

    selectThis: (e) => {
      let pathValue = e.target.attributes['data-path'].value;
      mc.clearSelected();

      crumb.innerHTML = pathValue.replace(/\/|.mp3|.mkv|.mp4/, '');

      let ext = mc.getExtension(pathValue);

      switch (ext) {
        case 'parent':
          mc.getPath(mc.updatePath(pathValue, true));
          break;
        case 'directory':
          mc.getPath(mc.updatePath(pathValue));
          break;
        case 'image':
        case 'video':
        case 'audio':
          mc.mediaViewer(pathValue, ext);
          break;
        default:
      }

      e.target.classList.add(_SELECTED);
      mc.getCurrentIndex();

    },

    getCurrentIndex: () => {
      let i = 0;
      listing.querySelectorAll('li').forEach((el) => {
        if (el.classList.contains(_SELECTED)) {
          currentIndex = i;
        }
        i++;
      });
    },

    clearSelected: () => {
      // Clear all list stylings
      listing.querySelectorAll('li').forEach((el) => {
        el.classList.remove(_SELECTED);
      });
    },

    updatePath: (pathValue, pop) => {
      if (pop) {
        currentPathArr.pop();
      } else {
        currentPathArr.push(pathValue);
      }      
      return mc.joinPath();
    },

    joinPath: (pathValue) => {
      if (pathValue) {
        return currentPathArr.join('') + pathValue;
      }
      return currentPathArr.join('');
    },

    mediaViewer: (pathValue, mediaType) => {
      image.src = '';
      video.src = '';
      audio.src = '';
      let path = mc.joinPath(pathValue);
      switch (mediaType) {
        case 'image':
          image.src = path;
          break;
        case 'video':
          video.src = path;
          break;
        case 'audio':
          audio.src = path;
          break;
        default:
      }
    },
    trackEnded: (e) => {
      // play next track
      e.target.src = mc.joinPath(playlistArr[++currentIndex].pathString);
      mc.clearSelected();
      listing.querySelectorAll('li').forEach((el) => {
        if (playlistArr[currentIndex].pathString.includes(el.innerHTML)) {
          el.classList.add(_SELECTED);
        }
      });
    },		
  }
})();

mc.init();