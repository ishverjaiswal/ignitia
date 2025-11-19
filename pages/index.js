// index.js — server-side redirect to the public home page
export async function getServerSideProps() {
  return {
    redirect: {
      destination: '/home',
      permanent: false,
    },
  }
}

export default function Index() {
  return null
}
