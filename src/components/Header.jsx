import pawLogo from "../assets/paws-logo.png";

const Header = () => {
  return (
    <>
      <header className="header">
        <img src={pawLogo} alt="Paw Logo" className="pawLogo" />
        <h1 className="title">Whimsical Whiskers</h1>
        <p className="desc">A Cat Breed Collection</p>
      </header>
    </>
  );
};

export default Header;
