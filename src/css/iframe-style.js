const style = (`
  body {
    margin: 0;
    font-size: 14px;
    line-height: 20px;
    color: #666;
    padding: 12px;
  }
  h1, h2, h3, h4, h5, h6, p, ul, ol, li {
    line-height: 1.5em;
    margin: 8px 0;
    color: #333;
    font-weight: normal;
  }
  h1 {
    font-size: 28px;
  }
  h2 {
    font-size: 24px;
  }
  h3 {
    font-size: 20px;
  }
  h4 {
    font-size: 16px;
  }
  h5 {
    font-size: 14px;
  }
  h6 {
    font-size: 12px;
  }
  p {
    font-size: 14px;
    line-height: 1.7em;
    color: #666;
  }
  body > p:first-child {
    margin-top: 0;
  }
  img {
    margin: 16px 0;
    max-width: 100%;
  }
  a {
    font-size: 14px;
    line-height: 1.7em;
    text-decoration: underline;
    color: #118bfb;
    &:focus {
      outline: none;
    }
  }
  ul, ol {
    padding-left: 24px;
    line-height: 1.7em;
  }
  ul, ol, li {
    color: #666;
    list-style: none;
  }
  ul > li {
    list-style-type: disc;
  }
  ol > li {
    list-style-type: decimal;
  }
  li {
    list-style-position: inside;
  }
  img.temporary-image {
    animation: circle 1s infinite linear;
  }
  @keyframes circle {
    from {
      transform: rotate(0);
    }
    to {
      transform: rotate(360deg);
    }
  }
`);
export default style;
