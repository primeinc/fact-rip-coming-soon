// Test component that throws in render when triggered
interface Props {
  shouldError?: boolean;
}

export function TestErrorTrigger({ shouldError = false }: Props) {
  if (shouldError) {
    throw new Error('Test render error - adversarial test');
  }
  
  return null;
}