import React from "react";

import styles from "./index-page.module.scss";

const IndexPage = () => (
  <div className={styles.indexPage}>
    <DiscordLoginBtn/>
  </div>
);

export default IndexPage;

const DiscordLoginBtn = () => {
  function onClick() {}

  return (
    <div className={styles.discordLoginBtn} onClick={onClick}>
      Login with Discord
    </div>
  );
};
