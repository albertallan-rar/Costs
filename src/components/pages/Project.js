import { v4 as uuidv4 } from "uuid";

import styles from "./Project.module.css";

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import Container from "../layout/Container";
import Loading from "../layout/Loading";
import Message from "../layout/Message";
import ProjectForm from "../project/ProjectForm";
import ServiceCard from "../services/ServiceCard";
import ServiceForm from "../services/ServiceForm";

function Project() {
  const { id } = useParams();

  const [project, setProject] = useState([]);
  const [services, setServices] = useState([]);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [message, setMessage] = useState();
  const [type, setType] = useState();

  useEffect(() => {
    setTimeout(() => {
      fetch(`http://localhost:5000/projects/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((resp) => resp.json())
        .then((data) => {
          setProject(data);
          setServices(data.services);
        })
        .catch((err) => console.log(err));
    }, 300);
  }, [id]);

  function editPost(project) {
    setMessage("");
    //budget validação
    if (project.budget < project.cost) {
      setMessage("Valor do orçamento foi estourado");
      setType("error");
      return false;
    }

    fetch(`http://localhost:5000/projects/${project.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(project),
    })
      .then((resp) => resp.json())
      .then((data) => {
        setProject(data);
        setShowProjectForm(false);
        setMessage("Valor atualizado");
        setType("sucess");
      })
      .catch((err) => console.log(err));
  }

  function createService(project) {
    setMessage("");
    const lastService = project.services[project.services.length - 1];

    lastService.id = uuidv4();

    const lastServiceCost = lastService.cost;

    const newCost = parseFloat(project.cost) + parseFloat(lastServiceCost);

    //maximo custo validação
    if (newCost > parseFloat(project.budget)) {
      setMessage("Orçamento ultrapassado");
      setType("error");
      console.log(project.budget);
      project.services.pop();
      return false;
    }

    //add service cost to project total cost

    project.cost = newCost;

    //update project
    fetch(`http://localhost:5000/projects/${project.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(project),
    })
      .then((resp) => resp.json())
      .then((data) => {
        //exibir serviços
        setShowServiceForm(false);
      })
      .catch((err) => console.log(err));
  }

  function removeService(id, cost) {
    setMessage("");
    const servicesUpdate = project.services.filter(
      (service) => service.id !== id
    );

    const projectUpdate = project;

    projectUpdate.services = servicesUpdate;
    projectUpdate.cost = parseFloat(projectUpdate.cost) - parseFloat(cost);

    fetch(`http://localhost:5000/projects/${projectUpdate.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(projectUpdate),
    })
      .then((resp) => resp.json())
      .then((data) => {
        setProject(projectUpdate);
        setServices(servicesUpdate);
        setMessage("Serviço removido com sucesso");
      })
      .catch((err) => console.log(err));
  }

  function toggleProjectForm() {
    setShowProjectForm(!showProjectForm);
  }
  function toggleServiceForm() {
    setShowServiceForm(!showServiceForm);
  }

  return (
    <>
      {project.name ? (
        <div className={styles.project_details}>
          <Container customClass="column">
            {message && <Message type={type} msg={message} />}
            <div className={styles.details_container}>
              <h1> Projeto: {project.name}</h1>
              <button onClick={toggleProjectForm} className={styles.btn}>
                {!showProjectForm ? "Editar Projeto" : "Fechar Projeto"}
              </button>
              {!showProjectForm ? (
                <div className={styles.project_info}>
                  <p>
                    <span>Categoria: </span>
                    {project.category.name}
                  </p>
                  <p>
                    <span>Total de Orçamento: </span>R${project.budget}
                  </p>
                  <p>
                    <span>Total Utilizado: </span>R${project.cost}
                  </p>
                </div>
              ) : (
                <div className={styles.project_info}>
                  <ProjectForm
                    handleSubmit={editPost}
                    btnText="Concluir Edição"
                    projectData={project}
                  />
                </div>
              )}
            </div>
            <div className={styles.service_from_container}>
              <h2>Adicionar Serviço:</h2>

              <button onClick={toggleServiceForm} className={styles.btn}>
                {!showServiceForm ? "Adicionar Serviço" : "Fechar Serviço"}
              </button>
              <div className={styles.project_info}>
                {showServiceForm && (
                  <ServiceForm
                    handleSubmit={createService}
                    btnText="Adicionar Serviço"
                    projectData={project}
                  />
                )}
              </div>
            </div>
            <h2>Serviços:</h2>
            <Container customClass="start">
              {services.length > 0 &&
                services.map((service) => (
                  <ServiceCard
                    id={service.id}
                    name={service.name}
                    cost={service.cost}
                    description={service.description}
                    key={service.id}
                    handleRemove={removeService}
                  />
                ))}
              {services.length === 0 && <p>Não há nenhum serviço</p>}
            </Container>
          </Container>
        </div>
      ) : (
        <Loading />
      )}
    </>
  );
}

export default Project;
