# Validate

`Validate` é uma pequena plataforma web para permitir que colegas validem rapidamente sites uns dos outros e criem links compartilháveis com parâmetros predefinidos. O sistema foi desenvolvido para a Github Week e serve como ferramenta de colaboração e feedback.

## Funcionalidades

- **Validação de sites**: cole o link de um site, veja prévia e envie um feedback completo incluindo título, email de contato, status (aprovado/reprovado), issues, solicitações de feature, tasks e detalhes de design system.
- **Geração de link Validate**: crie links com parâmetros (site, nome, email, tópico, opções de feedback) que outros usuários podem usar para abrir o formulário já configurado.
- **Ajude-me**: guia com explicações formais de como validar um site ou gerar link.
- **Termos de Uso**: documento acessível via rodapé, explicando responsabilidades antes de enviar ou gerar validações.
- **Header fixo** com animações e botões de navegação.
- **Modais centrados** para todos os fluxos (validar, link, ajuda, semana, feedback, rating, etc.).
- **Relógio em tempo real** no formulário de geração de link.
- **Responsivo** para telas menores.

## Estrutura de arquivos

- `index.html`: página principal com todos os modais e estrutura do site.
- `style.css`: estilos para layout, animações e modais.
- `script.js`: lógica de interatividade, manipulação de modais e geração de URLs.
- `media/`: imagens, fontes e outros recursos estáticos.

## Uso

1. Abra `index.html` em um servidor local (por exemplo, usando [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) ou `python -m http.server`).
2. Use os botões no cabeçalho para validar um site ou gerar um link.
3. Preencha os formulários e siga as instruções apresentadas nos modais.
4. Para validar usando links pré-configurados, clique nos cartões da página inicial; eles abrirão em nova aba com parâmetros na query string.

## Considerações de desenvolvimento

- O código é escrito em HTML, CSS e JavaScript puro (sem frameworks).
- Projeto voltado a propósitos educacionais e prototipagem rápida.
- Não há backend; todos os envios usam `mailto:` para enviar emails.

## License

Este projeto é fornecido como exemplo e pode ser modificado livremente.
>>>>>>> master
