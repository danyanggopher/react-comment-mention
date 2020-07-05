import React, {useState, useEffect} from "react";

export default function Comment(props) {
  const { id, text } = props.comment;
  //var retJSX = [];
  const [retJSX, setJSX] = useState([]);
  function addLink(text) {
    if (!text) {
      return [];
    }
    var re = /@\S+/g;
    var m;
    var updateJSX = []
    var users = {}; //@[]() conrresponding to link
    var words = text.split(" ");
    function fetchWhile(m) {
      m = re.exec(text);
      if (m) {
        var username = m[0].substring(m[0].lastIndexOf("[") + 1, m[0].lastIndexOf("]"));
        console.log(username);
        fetch(`https://api.github.com/search/users?q=${username}`, { json: true })
          .then(res => res.json())
          .then(res =>
            users[m[0]] = [username, res.items[0].html_url]
          )
          .then(res => {
              fetchWhile(m)
            }
          )

      } else {

        for (let i = 0; i < words.length; i++) {
          if (words[i] in users) {
            updateJSX.push(<a href={users[words[i]][1]}>{users[words[i]][0]}</a>);
            updateJSX.push(<span> </span>);
          } else {
            updateJSX.push(<span>{words[i]}</span>);
            updateJSX.push(<span> </span>);
          }
        }
        console.log(updateJSX);
        setJSX(updateJSX);
      }

    }
    fetchWhile(m);


  };

  useEffect(() => {
    console.log(text);
    addLink(text);
  }, []);

  return (
    <div className="media mb-3">
      <div className="media-body p-2 shadow-sm rounded bg-light border">
        <h6 className="mt-0 mb-1 text-muted">{id}</h6>
        {retJSX}
      </div>
    </div>
  );
}
