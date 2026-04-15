export function PlaceholderComponent({ title }: { title: string }) {
  return (
    <div style={{ padding: '20px' }}>
      <h1>{title}</h1>
      <p>Placeholder component</p>
    </div>
  );
}
