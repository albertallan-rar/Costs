import { useNavigate } from "react-router-dom";

import ProjectForm from "../project/ProjectForm";

import styles from "./NewProject.module.css";

function NewProject() {
  const navigate = useNavigate();

  function createPost(project) {
    //Inicializar cost and services
    project.cost = 0;
    project.services = [];
    //http://localhost:5000/projects
    fetch("http://192.168.2.110:5000/projects", {
      method: "Post",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify(project),
    })
      .then((resp) => resp.json())
      .then((data) => {
        console.log(data);
        //redirect
        navigate("/projects", { message: "Projeto criado com sucesso" });
      })
      .catch((err) => console.log(err));
  }

  return (
    <div className={styles.newproject_container}>
      <h1>Criar Projetos</h1>
      <p>Crie seu projeto para depois adicionar os servicos</p>
      <ProjectForm handleSubmit={createPost} btnText="Criar Projeto" />
    </div>
  );
}

export default NewProject;
