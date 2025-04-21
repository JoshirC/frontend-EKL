import { gql } from '@apollo/client';

export const CREATE_USER = gql`
  mutation CreateUser($userInput: CreateUserInput!) {
    createUser(userInput: $userInput) {
      rut
      nombre
      correo
      rol
    }
  }
`;

export const LOGIN = gql`
  mutation Login($loginUserInput: LoginUserInput!) {
    login(loginUserInput: $loginUserInput) {
      token
      user {
        rut
        nombre
        correo
        rol
      }
    }
  }
`; 